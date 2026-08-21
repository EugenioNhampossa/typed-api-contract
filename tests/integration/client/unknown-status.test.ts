import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"
import { HTTP_METHOD } from "typed-api-contract"
import { initClient, UnexpectedStatusError } from "typed-api-contract/client"
import { contract } from "../../fixtures/contracts/example.contract"
import { POSTS_API_BASE_URL } from "../../fixtures/msw/posts.handlers"
import { mswServer } from "../../setup/msw-server"

describe("unknown status code", () => {
  it("throws UnexpectedStatusError for a status not declared in the contract", async () => {
    const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json({ message: "error" }, { status: 500 }),
      ),
    )

    const error = await client.posts
      .getById({ params: { id: "1" } })
      .catch((reason: unknown) => reason)

    expect(error).toBeInstanceOf(UnexpectedStatusError)
    if (error instanceof UnexpectedStatusError) {
      expect(error.method).toBe(HTTP_METHOD.GET)
      expect(error.path).toBe("/posts/:id")
      expect(error.status).toBe(500)
    }
  })

  it("throws UnexpectedStatusError for a successful undeclared 201", async () => {
    const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json(
          { id: "1", title: "Hello", body: "World" },
          { status: 201 },
        ),
      ),
    )

    await expect(
      client.posts.getById({ params: { id: "1" } }),
    ).rejects.toMatchObject({
      name: "UnexpectedStatusError",
      status: 201,
    })
  })

  it("throws UnexpectedStatusError for an empty undeclared 204", async () => {
    const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, () => new HttpResponse(null, { status: 204 })),
    )

    const error = await client.posts
      .getById({ params: { id: "1" } })
      .catch((reason: unknown) => reason)

    expect(error).toBeInstanceOf(UnexpectedStatusError)
    if (error instanceof UnexpectedStatusError) {
      expect(error.status).toBe(204)
    }
  })
})
