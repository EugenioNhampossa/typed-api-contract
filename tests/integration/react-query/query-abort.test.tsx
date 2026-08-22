import { waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"
import { initClient } from "typed-api-contract/client"
import { initQueryHooks } from "typed-api-contract/react-query"
import { contract } from "../../fixtures/contracts/example.contract"
import { POSTS_API_BASE_URL } from "../../fixtures/msw/posts.handlers"
import { mswServer } from "../../setup/msw-server"
import { renderWithQueryClient } from "../../setup/render-with-query-client"

const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })
const hooks = initQueryHooks(contract, client)

function PostTitle() {
  const query = hooks.posts.getById({ params: { id: "1" } })

  if (query.data?.status === 200) {
    return <div>{query.data.body.title}</div>
  }

  return <div>loading</div>
}

describe("query abort", () => {
  it("aborts fetch when the query observer unmounts", async () => {
    let requestSignal: AbortSignal | undefined

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, async ({ request }) => {
        requestSignal = request.signal
        await new Promise<void>(() => undefined)
        return HttpResponse.json({
          id: "1",
          title: "Hello",
          body: "World",
        })
      }),
    )

    const { unmount } = renderWithQueryClient(<PostTitle />)

    await waitFor(() => {
      expect(requestSignal).toBeDefined()
    })

    unmount()

    await waitFor(() => {
      expect(requestSignal?.aborted).toBe(true)
    })
  })
})
