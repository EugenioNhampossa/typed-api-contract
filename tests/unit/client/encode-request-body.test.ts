import { describe, expect, it } from "vitest"
import { z } from "zod"
import { HTTP_METHOD } from "typed-api-contract"
import { encodeRequestBody } from "../../../src/client/encodeRequestBody"

describe("encodeRequestBody", () => {
  it("returns undefined when body is missing", () => {
    expect(
      encodeRequestBody(
        {
          method: HTTP_METHOD.POST,
          path: "/posts",
          responses: { 201: z.object({}) },
        },
        undefined,
      ),
    ).toEqual({ body: undefined, setJsonContentType: false })
  })

  it("JSON-stringifies a json body and sets Content-Type", () => {
    const encoded = encodeRequestBody(
      {
        method: HTTP_METHOD.POST,
        path: "/posts",
        responses: { 201: z.object({}) },
      },
      { title: "Hello" },
    )

    expect(encoded.setJsonContentType).toBe(true)
    expect(encoded.body).toBe('{"title":"Hello"}')
  })

  it("builds FormData for multipart object bodies", () => {
    const encoded = encodeRequestBody(
      {
        method: HTTP_METHOD.POST,
        path: "/uploads",
        contentType: "multipart",
        responses: { 201: z.object({}) },
      },
      { name: "a", tags: ["x", "y"] },
    )

    expect(encoded.setJsonContentType).toBe(false)
    expect(encoded.body).toBeInstanceOf(FormData)
    const formData = encoded.body as FormData
    expect(formData.get("name")).toBe("a")
    expect(formData.getAll("tags")).toEqual(["x", "y"])
  })

  it("passes through an existing FormData instance", () => {
    const formData = new FormData()
    formData.append("file", new Blob(["hi"]), "hi.txt")

    const encoded = encodeRequestBody(
      {
        method: HTTP_METHOD.POST,
        path: "/uploads",
        contentType: "multipart",
        responses: { 201: z.object({}) },
      },
      formData,
    )

    expect(encoded.body).toBe(formData)
    expect(encoded.setJsonContentType).toBe(false)
  })
})
