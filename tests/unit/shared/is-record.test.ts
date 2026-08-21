import { describe, expect, it } from "vitest"
import { isRecord } from "../../../src/shared/isRecord"

describe("isRecord", () => {
  it("returns true for plain objects", () => {
    expect(isRecord({ id: "1" })).toBe(true)
    expect(isRecord({})).toBe(true)
  })

  it("returns false for null, arrays, and primitives", () => {
    expect(isRecord(null)).toBe(false)
    expect(isRecord([1, 2])).toBe(false)
    expect(isRecord("object")).toBe(false)
    expect(isRecord(undefined)).toBe(false)
  })
})
