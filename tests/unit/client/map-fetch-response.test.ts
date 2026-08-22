import { describe, expect, it } from "vitest"
import { mapFetchResponse } from "../../../src/client/mapFetchResponse"

describe("mapFetchResponse", () => {
  it("parses a JSON object body", async () => {
    const raw = new Response(JSON.stringify({ id: "1" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })

    const mapped = await mapFetchResponse(raw)

    expect(mapped.status).toBe(200)
    expect(mapped.body).toEqual({ id: "1" })
    expect(mapped.raw).toBe(raw)
    expect(mapped.headers.get("Content-Type")).toBe("application/json")
  })

  it("returns undefined for an empty body", async () => {
    const mapped = await mapFetchResponse(new Response(""))

    expect(mapped.body).toBeUndefined()
  })

  it("throws SyntaxError for invalid JSON", async () => {
    await expect(
      mapFetchResponse(new Response("<html></html>", { status: 200 })),
    ).rejects.toBeInstanceOf(SyntaxError)
  })
})
