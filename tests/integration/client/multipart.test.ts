import { describe, expect, it } from "vitest"
import { z } from "zod"
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { initClient } from "typed-api-contract/client"
import { POSTS_API_BASE_URL } from "../../fixtures/msw/posts.handlers"

const contract = initContract().router({
  upload: {
    method: HTTP_METHOD.POST,
    path: "/uploads",
    contentType: "multipart",
    body: z.object({
      title: z.string(),
      file: z.custom<Blob>((value) => value instanceof Blob),
    }),
    responses: {
      201: z.object({ id: z.string(), title: z.string() }),
    },
  },
})

describe("multipart uploads", () => {
  it("sends FormData without a manual Content-Type", async () => {
    let seenBody: BodyInit | null | undefined
    let contentType: string | null = null

    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      fetch: async (_input, init) => {
        seenBody = init?.body
        contentType = new Headers(init?.headers).get("content-type")
        return new Response(JSON.stringify({ id: "1", title: "Report" }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        })
      },
    })

    const formData = new FormData()
    formData.append("title", "Report")
    formData.append(
      "file",
      new File(["hello"], "report.txt", { type: "text/plain" }),
    )

    const res = await client.upload({ body: formData })

    expect(seenBody).toBeInstanceOf(FormData)
    expect(contentType).toBeNull()
    expect(res.status).toBe(201)
    if (res.status === 201) {
      expect(res.body.title).toBe("Report")
    }
  })

  it("builds FormData from a plain object body", async () => {
    let seenBody: BodyInit | null | undefined

    const client = initClient(contract, {
      baseUrl: POSTS_API_BASE_URL,
      fetch: async (_input, init) => {
        seenBody = init?.body
        return new Response(JSON.stringify({ id: "1", title: "Report" }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        })
      },
    })

    const res = await client.upload({
      body: {
        title: "Report",
        file: new File(["hello"], "report.txt", { type: "text/plain" }),
      },
    })

    expect(seenBody).toBeInstanceOf(FormData)
    const formData = seenBody as FormData
    expect(formData.get("title")).toBe("Report")
    expect(formData.get("file")).toBeInstanceOf(File)
    expect(res.status).toBe(201)
  })
})
