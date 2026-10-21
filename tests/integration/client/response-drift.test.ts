import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"
import { ZodError } from "zod"
import { initClient } from "typed-api-contract/client"
import { contract } from "../../fixtures/contracts/example.contract"
import { POSTS_API_BASE_URL } from "../../fixtures/msw/posts.handlers"
import { mswServer } from "../../setup/msw-server"

describe("contract/response drift", () => {
  it("returns the raw body when validateResponse is not set", async () => {
    const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json({
          id: 1,
          title: "Hello",
          body: "World",
          extra: "kept",
        }),
      ),
    )

    const res = await client.posts.getById({ params: { id: "1" } })

    expect(res.status).toBe(200)
    if (res.status === 200) {
      expect(res.body).toEqual({
        id: 1,
        title: "Hello",
        body: "World",
        extra: "kept",
      })
    }
  })

  it("throws ZodError when MSW returns a shape that does not match the schema", async () => {
    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      validateResponse: true,
    })

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json({ id: 1, title: "Hello", body: "World" }),
      ),
    )

    await expect(
      client.posts.getById({ params: { id: "1" } }),
    ).rejects.toBeInstanceOf(ZodError)
  })

  it("throws ZodError when a declared 404 body is missing message", async () => {
    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      validateResponse: true,
    })

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json({ error: "missing" }, { status: 404 }),
      ),
    )

    await expect(
      client.posts.getById({ params: { id: "1" } }),
    ).rejects.toBeInstanceOf(ZodError)
  })

  it("throws ZodError when the 200 body is an array instead of an object", async () => {
    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      validateResponse: true,
    })

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json([{ id: "1", title: "Hello", body: "World" }]),
      ),
    )

    await expect(
      client.posts.getById({ params: { id: "1" } }),
    ).rejects.toBeInstanceOf(ZodError)
  })

  it("throws ZodError when the 200 body is empty", async () => {
    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      validateResponse: true,
    })

    mswServer.use(
      http.get(
        `${POSTS_API_BASE_URL}/posts/:id`,
        () => new HttpResponse("", { status: 200 }),
      ),
    )

    await expect(
      client.posts.getById({ params: { id: "1" } }),
    ).rejects.toBeInstanceOf(ZodError)
  })

  it("accepts extra fields on a 200 body and keeps the declared shape", async () => {
    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      validateResponse: true,
    })

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json({
          id: "1",
          title: "Hello",
          body: "World",
          extra: "ignored",
        }),
      ),
    )

    const res = await client.posts.getById({ params: { id: "1" } })

    expect(res.status).toBe(200)
    if (res.status === 200) {
      expect(res.body).toEqual({
        id: "1",
        title: "Hello",
        body: "World",
      })
    }
  })
})
