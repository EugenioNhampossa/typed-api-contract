import { screen, waitFor } from "@testing-library/react"
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

  if (query.data?.status === 404) {
    return <div>{query.data.body.message}</div>
  }

  if (query.error) {
    return <div>{query.error.name}</div>
  }

  return <div>loading</div>
}

describe("contract + client + hooks", () => {
  it("client returns a validated 200", async () => {
    const res = await client.posts.getById({ params: { id: "1" } })

    expect(res.status).toBe(200)
    if (res.status === 200) {
      expect(res.body.title).toBe("Hello")
    }
  })

  it("hooks narrow a 200 response in a real component", async () => {
    renderWithQueryClient(<PostTitle />)

    await waitFor(() => {
      expect(screen.getByText("Hello")).toBeTruthy()
    })
  })

  it("hooks treat a declared 404 as data, not as a query error", async () => {
    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json({ message: "missing" }, { status: 404 }),
      ),
    )

    renderWithQueryClient(<PostTitle />)

    await waitFor(() => {
      expect(screen.getByText("missing")).toBeTruthy()
    })
    expect(screen.queryByText("ZodError")).toBeNull()
    expect(screen.queryByText("UnexpectedStatusError")).toBeNull()
  })

  it("hooks surface UnexpectedStatusError for an undeclared status", async () => {
    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json({ message: "error" }, { status: 500 }),
      ),
    )

    renderWithQueryClient(<PostTitle />)

    await waitFor(() => {
      expect(screen.getByText("UnexpectedStatusError")).toBeTruthy()
    })
  })
})
