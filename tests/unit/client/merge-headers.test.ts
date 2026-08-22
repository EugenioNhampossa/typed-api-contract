import { describe, expect, it } from "vitest"
import { mergeHeaders } from "../../../src/client/mergeHeaders"

describe("mergeHeaders", () => {
  it("returns an empty Headers object when every source is missing", () => {
    const headers = mergeHeaders([undefined, undefined])

    expect(headers.get("Authorization")).toBeNull()
    expect(headers.get("Content-Type")).toBeNull()
  })

  it("skips undefined sources", () => {
    const headers = mergeHeaders([
      undefined,
      { Authorization: "Bearer a" },
      undefined,
    ])

    expect(headers.get("Authorization")).toBe("Bearer a")
  })

  it("lets later sources overwrite earlier keys", () => {
    const headers = mergeHeaders([
      { "Content-Type": "application/json", Authorization: "Bearer a" },
      { Authorization: "Bearer b" },
    ])

    expect(headers.get("Content-Type")).toBe("application/json")
    expect(headers.get("Authorization")).toBe("Bearer b")
  })

  it("overwrites keys case-insensitively", () => {
    const headers = mergeHeaders([
      { authorization: "Bearer a" },
      { Authorization: "Bearer b" },
    ])

    expect(headers.get("authorization")).toBe("Bearer b")
  })
})
