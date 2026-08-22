import { http, HttpResponse } from "msw"
import { describe, expect, it, vi } from "vitest"
import { ZodError } from "zod"
import {
  initClient,
  UnexpectedStatusError,
  type ClientInterceptor,
} from "typed-api-contract/client"
import { contract } from "../../fixtures/contracts/example.contract"
import { POSTS_API_BASE_URL } from "../../fixtures/msw/posts.handlers"
import { mswServer } from "../../setup/msw-server"

const AUTH_HEADER = "authorization"

describe("initClient interceptors", () => {
  it("lets onRequest add headers and rewrite the URL", async () => {
    const interceptor: ClientInterceptor = {
      onRequest(request) {
        request.headers.set("Authorization", "Bearer intercepted")
        return {
          ...request,
          url: `${POSTS_API_BASE_URL}/posts/rewritten`,
        }
      },
    }
    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      interceptors: [interceptor],
    })
    let authorization = ""
    let requestUrl = ""

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, ({ request, params }) => {
        authorization = request.headers.get(AUTH_HEADER) ?? ""
        requestUrl = request.url
        return HttpResponse.json({
          id: String(params.id),
          title: "Hello",
          body: "World",
        })
      }),
    )

    const res = await client.posts.getById({ params: { id: "1" } })

    expect(authorization).toBe("Bearer intercepted")
    expect(new URL(requestUrl).pathname).toBe("/posts/rewritten")
    expect(res.status).toBe(200)
    if (res.status === 200) {
      expect(res.body.id).toBe("rewritten")
    }
  })

  it("runs interceptors in array order", async () => {
    const order: string[] = []
    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      interceptors: [
        {
          onRequest(request) {
            order.push("request-1")
            return request
          },
          onResponse(_request, response) {
            order.push("response-1")
            return response
          },
        },
        {
          onRequest(request) {
            order.push("request-2")
            return request
          },
          onResponse(_request, response) {
            order.push("response-2")
            return response
          },
        },
      ],
    })

    await client.posts.getById({ params: { id: "1" } })

    expect(order).toEqual([
      "request-1",
      "request-2",
      "response-1",
      "response-2",
    ])
  })

  it("runs onResponse before UnexpectedStatusError", async () => {
    let seenStatus: number | undefined
    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      interceptors: [
        {
          onResponse(_request, response) {
            seenStatus = response.status
            return response
          },
        },
      ],
    })

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json({ message: "error" }, { status: 500 }),
      ),
    )

    await expect(
      client.posts.getById({ params: { id: "1" } }),
    ).rejects.toBeInstanceOf(UnexpectedStatusError)
    expect(seenStatus).toBe(500)
  })

  it("runs onError when fetch rejects", async () => {
    const networkError = new TypeError("network")
    const onError = vi.fn()
    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      fetch: async () => {
        throw networkError
      },
      interceptors: [{ onError }],
    })

    await expect(
      client.posts.getById({ params: { id: "1" } }),
    ).rejects.toBe(networkError)
    expect(onError).toHaveBeenCalledOnce()
    expect(onError.mock.calls[0]?.[1]).toBe(networkError)
  })

  it("runs onError when JSON parse throws", async () => {
    const onError = vi.fn()
    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      interceptors: [{ onError }],
    })

    mswServer.use(
      http.get(
        `${POSTS_API_BASE_URL}/posts/:id`,
        () =>
          new HttpResponse("<html>nope</html>", {
            status: 200,
            headers: { "Content-Type": "text/html" },
          }),
      ),
    )

    await expect(
      client.posts.getById({ params: { id: "1" } }),
    ).rejects.toBeInstanceOf(SyntaxError)
    expect(onError).toHaveBeenCalledOnce()
    expect(onError.mock.calls[0]?.[1]).toBeInstanceOf(SyntaxError)
  })

  it("keeps phase 1 behaviour with an empty interceptor list", async () => {
    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      interceptors: [],
    })

    const res = await client.posts.getById({ params: { id: "1" } })

    expect(res.status).toBe(200)
    if (res.status === 200) {
      expect(res.body.title).toBe("Hello")
    }
  })

  it("lets onError recover with a ClientResponse", async () => {
    const recovered = {
      status: 200,
      body: { id: "1", title: "Recovered", body: "Post" },
      headers: new Headers({ "Content-Type": "application/json" }),
      raw: new Response(),
    }
    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      fetch: async () => {
        throw new TypeError("network")
      },
      interceptors: [
        {
          onError() {
            return recovered
          },
        },
      ],
    })

    const res = await client.posts.getById({ params: { id: "1" } })

    expect(res.status).toBe(200)
    if (res.status === 200) {
      expect(res.body.title).toBe("Recovered")
    }
  })

  it("does not run onError again when a recovered response fails validation", async () => {
    const onError = vi.fn(() => ({
      status: 200,
      body: { id: 1 },
      headers: new Headers(),
      raw: new Response(),
    }))
    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      fetch: async () => {
        throw new TypeError("network")
      },
      interceptors: [{ onError }],
    })

    await expect(
      client.posts.getById({ params: { id: "1" } }),
    ).rejects.toBeInstanceOf(ZodError)
    expect(onError).toHaveBeenCalledOnce()
  })
})
