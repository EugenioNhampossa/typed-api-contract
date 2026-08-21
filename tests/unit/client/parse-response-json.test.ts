import { describe, expect, it } from "vitest"
import { parseResponseJson } from "../../../src/client/parseResponseJson"

describe("parseResponseJson", () => {
  it("parses a JSON object body", async () => {
    const response = new Response(JSON.stringify({ id: "1" }), {
      headers: { "Content-Type": "application/json" },
    })

    await expect(parseResponseJson(response)).resolves.toEqual({ id: "1" })
  })

  it("returns undefined for an empty body", async () => {
    await expect(parseResponseJson(new Response(""))).resolves.toBeUndefined()
  })

  it("throws SyntaxError for invalid JSON", async () => {
    await expect(
      parseResponseJson(new Response("<html></html>")),
    ).rejects.toBeInstanceOf(SyntaxError)
  })
})
