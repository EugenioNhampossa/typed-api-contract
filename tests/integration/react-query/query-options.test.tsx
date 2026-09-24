import { screen, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"
import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { initClient } from "typed-api-contract/client"
import { initQueryOptions } from "typed-api-contract/react-query"
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
        limit: z.number().optional(),
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

describe("initQueryOptions prefetch", () => {
  const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })
  const options = initQueryOptions(contract, client)

  it("works with useQuery via queryOptions", async () => {
    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts`, () =>
        HttpResponse.json({
          items: [{ id: "1", title: "Hello" }],
          nextCursor: null,
        }),
      ),
    )

    function Title() {
      const query = useQuery(options.posts.list({ query: {} }))
      if (query.data?.status === 200) {
        return <div>{query.data.body.items[0]?.title}</div>
      }
      return <div>loading</div>
    }

    renderWithQueryClient(<Title />)

    await waitFor(() => {
      expect(screen.getByText("Hello")).toBeTruthy()
    })
  })
})
