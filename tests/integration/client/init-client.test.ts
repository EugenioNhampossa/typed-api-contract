import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"
import { ZodError } from "zod"
import { HTTP_METHOD } from "typed-api-contract"
import { initClient, UnexpectedStatusError } from "typed-api-contract/client"
import { contract } from "../../fixtures/contracts/example.contract"
import { POSTS_API_BASE_URL } from "../../fixtures/msw/posts.handlers"
import { mswServer } from "../../setup/msw-server"

const JSON_CONTENT_TYPE = "application/json"

describe("initClient", () => {
  const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })

  it("returns a validated body on 200", async () => {
    const res = await client.posts.getById({ params: { id: "1" } })

    expect(res.status).toBe(200)
    if (res.status === 200) {
      expect(res.body.title).toBe("Hello")
    }
  })

  it("returns a declared 404 error body", async () => {
    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json({ message: "not found" }, { status: 404 }),
      ),
    )

    const res = await client.posts.getById({ params: { id: "missing" } })

    expect(res.status).toBe(404)
    if (res.status === 404) {
      expect(res.body.message).toBe("not found")
    }
  })

  it("returns the raw body when validateResponse is not set", async () => {
    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json({ id: 1, title: "Hello", body: "World" }),
      ),
    )

    const res = await client.posts.getById({ params: { id: "bad" } })

    expect(res.status).toBe(200)
    if (res.status === 200) {
      expect(res.body).toEqual({ id: 1, title: "Hello", body: "World" })
    }
  })

  it("throws ZodError when validateResponse is true and the body does not match", async () => {
    const validatingClient = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      validateResponse: true,
    })

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, () =>
        HttpResponse.json({ id: 1, title: "Hello", body: "World" }),
      ),
    )

    await expect(
      validatingClient.posts.getById({ params: { id: "bad" } }),
    ).rejects.toBeInstanceOf(ZodError)
  })

  it("throws UnexpectedStatusError for an undeclared status", async () => {
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

  it("does not send a body on GET", async () => {
    let didSendBody = false

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, ({ request }) => {
        didSendBody = request.body !== null
        return HttpResponse.json({
          id: "1",
          title: "Hello",
          body: "World",
        })
      }),
    )

    await client.posts.getById({ params: { id: "1" } })

    expect(didSendBody).toBe(false)
  })

  it("sends JSON on POST", async () => {
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

    const res = await client.posts.create({
      body: { title: "Hello", body: "World" },
    })

    expect(contentType).toBe(JSON_CONTENT_TYPE)
    expect(res.status).toBe(201)
    if (res.status === 201) {
      expect(res.body.title).toBe("Hello")
    }
  })

  it("returns a declared 400 body on POST", async () => {
    mswServer.use(
      http.post(`${POSTS_API_BASE_URL}/posts`, () =>
        HttpResponse.json({ message: "invalid body" }, { status: 400 }),
      ),
    )

    const res = await client.posts.create({
      body: { title: "Hello", body: "World" },
    })

    expect(res.status).toBe(400)
    if (res.status === 400) {
      expect(res.body.message).toBe("invalid body")
    }
  })

  it("throws SyntaxError when the response is not JSON", async () => {
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
  })

  it("encodes path params in the request URL", async () => {
    let requestUrl = ""

    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts/:id`, ({ request }) => {
        requestUrl = request.url
        return HttpResponse.json({
          id: "a b",
          title: "Hello",
          body: "World",
        })
      }),
    )

    await client.posts.getById({ params: { id: "a b" } })

    expect(new URL(requestUrl).pathname).toBe("/posts/a%20b")
  })

  it("returns an empty list from the list endpoint", async () => {
    mswServer.use(
      http.get(`${POSTS_API_BASE_URL}/posts`, () => HttpResponse.json([])),
    )

    const res = await client.posts.list({ query: {} })

    expect(res.status).toBe(200)
    if (res.status === 200) {
      expect(res.body).toEqual([])
    }
  })
})
