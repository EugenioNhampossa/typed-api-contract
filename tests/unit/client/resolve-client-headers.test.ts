import { describe, expect, it, vi } from "vitest"
import { resolveClientHeaders } from "../../../src/client/resolveClientHeaders"

describe("resolveClientHeaders", () => {
  it("returns undefined when headers are omitted", async () => {
    await expect(resolveClientHeaders(undefined)).resolves.toBeUndefined()
  })

  it("returns a static header bag as-is", async () => {
    const headers = { Authorization: "Bearer static" }

    await expect(resolveClientHeaders(headers)).resolves.toBe(headers)
  })

  it("invokes a sync thunk on each call", async () => {
    const thunk = vi
      .fn<() => HeadersInit>()
      .mockReturnValueOnce({ Authorization: "Bearer a" })
      .mockReturnValueOnce({ Authorization: "Bearer b" })

    await expect(resolveClientHeaders(thunk)).resolves.toEqual({
      Authorization: "Bearer a",
    })
    await expect(resolveClientHeaders(thunk)).resolves.toEqual({
      Authorization: "Bearer b",
    })
    expect(thunk).toHaveBeenCalledTimes(2)
  })

  it("awaits an async thunk", async () => {
    const thunk = vi.fn(async () => ({ Authorization: "Bearer async" }))

    await expect(resolveClientHeaders(thunk)).resolves.toEqual({
      Authorization: "Bearer async",
    })
  })
})
