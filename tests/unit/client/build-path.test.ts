import { describe, expect, it } from "vitest"
import { buildPath } from "typed-api-contract/client"

describe("buildPath", () => {
  it("interpolates path params", () => {
    expect(buildPath("/posts/:id", { id: "1" })).toBe("/posts/1")
  })

  it("encodes path params", () => {
    expect(buildPath("/posts/:id", { id: "a b" })).toBe("/posts/a%20b")
  })

  it("encodes reserved URI characters in params", () => {
    expect(buildPath("/posts/:id", { id: "a/b?c=1" })).toBe(
      "/posts/a%2Fb%3Fc%3D1",
    )
  })

  it("interpolates multiple path params", () => {
    expect(
      buildPath("/posts/:postId/comments/:commentId", {
        postId: "1",
        commentId: "2",
      }),
    ).toBe("/posts/1/comments/2")
  })

  it("returns the path unchanged when params are missing", () => {
    expect(buildPath("/posts", undefined)).toBe("/posts")
    expect(buildPath("/posts/:id", {})).toBe("/posts/:id")
  })

  it("returns the path unchanged for null, arrays, and primitives", () => {
    expect(buildPath("/posts/:id", null)).toBe("/posts/:id")
    expect(buildPath("/posts/:id", ["1"])).toBe("/posts/:id")
    expect(buildPath("/posts/:id", "1")).toBe("/posts/:id")
  })

  it("skips undefined param values and leaves the placeholder", () => {
    expect(buildPath("/posts/:id", { id: undefined })).toBe("/posts/:id")
  })

  it("interpolates numeric param values", () => {
    expect(buildPath("/posts/:id", { id: 42 })).toBe("/posts/42")
  })

  it("interpolates an empty string param", () => {
    expect(buildPath("/posts/:id", { id: "" })).toBe("/posts/")
  })

  it("ignores extra params that are not in the path", () => {
    expect(buildPath("/posts/:id", { id: "1", extra: "x" })).toBe("/posts/1")
  })

  it("does not replace a longer param name with a shorter one", () => {
    expect(
      buildPath("/posts/:id/meta/:id2", { id: "1", id2: "2" }),
    ).toBe("/posts/1/meta/2")
  })
})
