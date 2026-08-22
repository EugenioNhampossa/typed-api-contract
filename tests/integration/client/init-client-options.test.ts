import { http, HttpResponse } from "msw"
import { describe, expect, it, vi } from "vitest"
import { initClient } from "typed-api-contract/client"
import { contract } from "../../fixtures/contracts/example.contract"
import { POSTS_API_BASE_URL } from "../../fixtures/msw/posts.handlers"
import { mswServer } from "../../setup/msw-server"

const AUTH_HEADER = "authorization"

describe("initClient options", () => {
  it("sends static client headers on GET and POST", async () => {
    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      headers: { Authorization: "Bearer static" },
    })
    const seen: string[] = []

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, ({ request }) => {
        seen.push(request.headers.get(AUTH_HEADER) ?? "")
        return HttpResponse.json({
          id: "1",
          title: "Hello",
          body: "World",
        })
      }),
      http.post(`${POSTS_API_BASE_URL}/posts`, async ({ request }) => {
        seen.push(request.headers.get(AUTH_HEADER) ?? "")
        await request.json()
        return HttpResponse.json(
          { id: "1", title: "Hello", body: "World" },
          { status: 201 },
        )
      }),
    )

    await client.posts.getById({ params: { id: "1" } })
    await client.posts.create({ body: { title: "Hello", body: "World" } })

    expect(seen).toEqual(["Bearer static", "Bearer static"])
  })

  it("resolves an async headers thunk on every call", async () => {
    let token = "a"
    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      headers: async () => ({ Authorization: `Bearer ${token}` }),
    })
    const seen: string[] = []

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, ({ request }) => {
        seen.push(request.headers.get(AUTH_HEADER) ?? "")
        return HttpResponse.json({
          id: "1",
          title: "Hello",
          body: "World",
        })
      }),
    )

    await client.posts.getById({ params: { id: "1" } })
    token = "b"
    await client.posts.getById({ params: { id: "1" } })

    expect(seen).toEqual(["Bearer a", "Bearer b"])
  })

  it("lets per-call headers override client headers", async () => {
    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      headers: { Authorization: "Bearer client" },
    })
    let authorization = ""

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, ({ request }) => {
        authorization = request.headers.get(AUTH_HEADER) ?? ""
        return HttpResponse.json({
          id: "1",
          title: "Hello",
          body: "World",
        })
      }),
    )

    await client.posts.getById({
      params: { id: "1" },
      headers: { Authorization: "Bearer call" },
    })

    expect(authorization).toBe("Bearer call")
  })

  it("invokes a custom fetch instead of the global one", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(globalThis.fetch)
    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      fetch,
    })

    await client.posts.getById({ params: { id: "1" } })

    expect(fetch).toHaveBeenCalledOnce()
    expect(String(fetch.mock.calls[0]?.[0])).toContain("/posts/1")
  })

  it("rejects when the per-call signal is already aborted", async () => {
    const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })
    const controller = new AbortController()
    controller.abort()

    await expect(
      client.posts.getById({
        params: { id: "1" },
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ name: "AbortError" })
  })

  it("forwards credentials to fetch", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(globalThis.fetch)
    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      fetch,
      credentials: "include",
    })

    await client.posts.getById({ params: { id: "1" } })

    expect(fetch.mock.calls[0]?.[1]?.credentials).toBe("include")
  })

  it("does not set Content-Type on GET", async () => {
    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      headers: { Authorization: "Bearer static" },
    })
    let contentType: string | null = "set"

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, ({ request }) => {
        contentType = request.headers.get("content-type")
        return HttpResponse.json({
          id: "1",
          title: "Hello",
          body: "World",
        })
      }),
    )

    await client.posts.getById({ params: { id: "1" } })

    expect(contentType).toBeNull()
  })

  it("still sets JSON Content-Type on POST", async () => {
    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      headers: { Authorization: "Bearer static" },
    })
    let contentType: string | null = null

    mswServer.use(
      http.post(`${POSTS_API_BASE_URL}/posts`, async ({ request }) => {
        contentType = request.headers.get("content-type")
        await request.json()
        return HttpResponse.json(
          { id: "1", title: "Hello", body: "World" },
          { status: 201 },
        )
      }),
    )

    await client.posts.create({ body: { title: "Hello", body: "World" } })

    expect(contentType).toBe("application/json")
  })
})
