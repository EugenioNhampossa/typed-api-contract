import { describe, expect, it } from "vitest"
import { z } from "zod"
import { isZodSchema } from "../../../src/client/isZodSchema"

describe("isZodSchema", () => {
  it("returns true for a Zod schema", () => {
    expect(isZodSchema(z.object({ id: z.string() }))).toBe(true)
  })

  it("returns false for objects without parse", () => {
    expect(isZodSchema({ 200: true })).toBe(false)
    expect(isZodSchema(null)).toBe(false)
    expect(isZodSchema("schema")).toBe(false)
  })

  it("returns false when parse exists but is not a function", () => {
    expect(isZodSchema({ parse: true })).toBe(false)
  })
})
