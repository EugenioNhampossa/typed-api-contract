import { describe, expect, it } from "vitest"
import { isClientResponse } from "../../../src/client/isClientResponse"
import { createExampleResponse } from "../../fixtures/client/create-example-response"

describe("isClientResponse", () => {
  it("returns true for a mapped client response", () => {
    expect(isClientResponse(createExampleResponse())).toBe(true)
  })

  it("returns false for errors, null, and partial objects", () => {
    expect(isClientResponse(new Error("network"))).toBe(false)
    expect(isClientResponse(null)).toBe(false)
    expect(isClientResponse({ status: 200 })).toBe(false)
    expect(
      isClientResponse({
        status: 200,
        body: {},
        headers: new Headers(),
        raw: {},
      }),
    ).toBe(false)
  })
})
