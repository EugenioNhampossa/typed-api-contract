import { http, HttpResponse } from "msw"
import { describe, expect, it, vi } from "vitest"
import {
  createAuthRefreshInterceptor,
  initClient,
} from "typed-api-contract/client"
import { contract } from "../../fixtures/contracts/example.contract"
import { POSTS_API_BASE_URL } from "../../fixtures/msw/posts.handlers"
import { mswServer } from "../../setup/msw-server"

describe("createAuthRefreshInterceptor", () => {
  it("refreshes once and retries after a 401", async () => {
    let token = "expired"
    let refreshCount = 0
    let seenAuth: string[] = []

    const interceptor = createAuthRefreshInterceptor({
      getAccessToken: () => token,
      refresh: async () => {
        refreshCount += 1
        token = "fresh"
      },
    })

    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      interceptors: [interceptor],
    })

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, ({ request }) => {
        const authorization = request.headers.get("authorization") ?? ""
        seenAuth.push(authorization)

        if (authorization === "Bearer expired") {
          return HttpResponse.json({ message: "expired" }, { status: 401 })
        }

        return HttpResponse.json({
          id: "1",
          title: "Hello",
          body: "World",
        })
      }),
    )

    const res = await client.posts.getById({ params: { id: "1" } })

    expect(refreshCount).toBe(1)
    expect(seenAuth).toEqual(["Bearer expired", "Bearer fresh"])
    expect(res.status).toBe(200)
  })

  it("shares a single refresh across concurrent 401s", async () => {
    let token = "expired"
    const refresh = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20))
      token = "fresh"
    })

    const interceptor = createAuthRefreshInterceptor({
      getAccessToken: () => token,
      refresh,
    })

    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      interceptors: [interceptor],
    })

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, ({ request }) => {
        const authorization = request.headers.get("authorization") ?? ""

        if (authorization === "Bearer expired") {
          return HttpResponse.json({ message: "expired" }, { status: 401 })
        }

        return HttpResponse.json({
          id: "1",
          title: "Hello",
          body: "World",
        })
      }),
    )

    const [first, second] = await Promise.all([
      client.posts.getById({ params: { id: "1" } }),
      client.posts.getById({ params: { id: "1" } }),
    ])

    expect(refresh).toHaveBeenCalledOnce()
    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
  })

  it("does not loop when the retry still returns 401", async () => {
    const refresh = vi.fn(async () => undefined)

    const interceptor = createAuthRefreshInterceptor({
      getAccessToken: () => "expired",
      refresh,
    })

    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      interceptors: [interceptor],
    })

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json({ message: "expired" }, { status: 401 }),
      ),
    )

    await expect(
      client.posts.getById({ params: { id: "1" } }),
    ).rejects.toMatchObject({ name: "AuthUnauthorizedError" })
    expect(refresh).toHaveBeenCalledOnce()
  })
})
