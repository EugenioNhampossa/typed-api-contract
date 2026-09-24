import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"
import { z } from "zod"
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { initClient } from "typed-api-contract/client"
import { POSTS_API_BASE_URL } from "../../fixtures/msw/posts.handlers"
import { mswServer } from "../../setup/msw-server"

const JSON_CONTENT_TYPE = "application/json"

const contract = initContract().router({
  remove: {
    method: HTTP_METHOD.DELETE,
    path: "/posts/:id",
    pathParams: z.object({ id: z.string() }),
    body: z.object({ reason: z.string() }),
    responses: { 204: z.undefined() },
  },
  softDelete: {
    method: HTTP_METHOD.DELETE,
    path: "/posts/:id/soft",
    pathParams: z.object({ id: z.string() }),
    responses: { 204: z.void() },
  },
})

describe("empty responses and DELETE body", () => {
  const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })

  it("sends a JSON body on DELETE when body is declared", async () => {
    let contentType: string | null = null
    let payload: unknown

    mswServer.use(
      http.delete(`${POSTS_API_BASE_URL}/posts/:id`, async ({ request }) => {
        contentType = request.headers.get("content-type")
        payload = await request.json()
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const res = await client.remove({
      params: { id: "1" },
      body: { reason: "spam" },
    })

    expect(contentType).toContain(JSON_CONTENT_TYPE)
    expect(payload).toEqual({ reason: "spam" })
    expect(res.status).toBe(204)
    expect(res.body).toBeUndefined()
  })

  it("accepts an empty 204 when the schema is z.void()", async () => {
    mswServer.use(
      http.delete(
        `${POSTS_API_BASE_URL}/posts/:id/soft`,
        () => new HttpResponse(null, { status: 204 }),
      ),
    )

    const res = await client.softDelete({ params: { id: "1" } })

    expect(res.status).toBe(204)
  })
})
