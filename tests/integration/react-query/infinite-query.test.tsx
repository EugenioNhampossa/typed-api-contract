import { screen, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"
import { z } from "zod"
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { initClient } from "typed-api-contract/client"
import { initQueryHooks } from "typed-api-contract/react-query"
import { POSTS_API_BASE_URL } from "../../fixtures/msw/posts.handlers"
import { mswServer } from "../../setup/msw-server"
import { renderWithQueryClient } from "../../setup/render-with-query-client"

const contract = initContract().router({
  posts: {
    list: {
      method: HTTP_METHOD.GET,
      path: "/posts",
      query: z.object({
        cursor: z.string().optional(),
      }),
      responses: {
        200: z.object({
          items: z.array(z.object({ id: z.string(), title: z.string() })),
          nextCursor: z.string().nullable(),
        }),
      },
      infinite: {
        initialPageParam: {} as { cursor?: string },
        getNextPageParam: (lastPage) => {
          const page = lastPage as {
            status: number
            body: { nextCursor: string | null }
          }
          if (page.status !== 200) {
            return undefined
          }
          if (page.body.nextCursor === null) {
            return undefined
          }
          return { cursor: page.body.nextCursor }
        },
      },
    },
  },
})

describe("infinite query hooks", () => {
  const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })
  const hooks = initQueryHooks(contract, client)

  it("loads the first page through hooks.posts.list.infinite", async () => {
    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts`, ({ request }) => {
        const cursor = new URL(request.url).searchParams.get("cursor")
        if (cursor === "page-2") {
          return HttpResponse.json({
            items: [{ id: "2", title: "Second" }],
            nextCursor: null,
          })
        }

        return HttpResponse.json({
          items: [{ id: "1", title: "First" }],
          nextCursor: "page-2",
        })
      }),
    )

    function List() {
      const query = hooks.posts.list.infinite({ query: {} })
      const titles =
        query.data?.pages.flatMap((page) =>
          page.status === 200 ? page.body.items.map((item) => item.title) : [],
        ) ?? []

      return <div>{titles.join(",") || "loading"}</div>
    }

    renderWithQueryClient(<List />)

    await waitFor(() => {
      expect(screen.getByText("First")).toBeTruthy()
    })
  })
})
