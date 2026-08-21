import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"
import { initClient } from "typed-api-contract/client"
import { contract } from "../../fixtures/contracts/example.contract"
import { POSTS_API_BASE_URL } from "../../fixtures/msw/posts.handlers"
import { mswServer } from "../../setup/msw-server"

describe("optional query params", () => {
  it("omits an optional query param at runtime", async () => {
    let requestUrl = ""
    const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts`, ({ request }) => {
        requestUrl = request.url
        return HttpResponse.json([])
      }),
    )

    const res = await client.posts.list({ query: {} })

    expect(res.status).toBe(200)
    expect(new URL(requestUrl).search).toBe("")
  })

  it("sends an optional query param when provided", async () => {
    let requestUrl = ""
    const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts`, ({ request }) => {
        requestUrl = request.url
        return HttpResponse.json([])
      }),
    )

    await client.posts.list({ query: { page: 2 } })

    expect(new URL(requestUrl).searchParams.get("page")).toBe("2")
  })

  it("sends page=0 when zero is provided", async () => {
    let requestUrl = ""
    const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts`, ({ request }) => {
        requestUrl = request.url
        return HttpResponse.json([])
      }),
    )

    await client.posts.list({ query: { page: 0 } })

    expect(new URL(requestUrl).searchParams.get("page")).toBe("0")
  })

  it("omits an optional query param set to undefined", async () => {
    let requestUrl = ""
    const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts`, ({ request }) => {
        requestUrl = request.url
        return HttpResponse.json([])
      }),
    )

    await client.posts.list({ query: { page: undefined } })

    expect(new URL(requestUrl).search).toBe("")
  })

  it("sends a required query param", async () => {
    let requestUrl = ""
    const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/search`, ({ request }) => {
        requestUrl = request.url
        return HttpResponse.json([])
      }),
    )

    const res = await client.posts.search({ query: { q: "gifim" } })

    expect(res.status).toBe(200)
    expect(new URL(requestUrl).searchParams.get("q")).toBe("gifim")
  })
})
