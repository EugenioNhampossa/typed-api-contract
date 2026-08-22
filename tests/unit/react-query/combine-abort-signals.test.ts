import { describe, expect, it } from "vitest"
import { combineAbortSignals } from "../../../src/react-query/combineAbortSignals"

describe("combineAbortSignals", () => {
  it("returns undefined when both inputs are missing", () => {
    expect(combineAbortSignals(undefined, undefined)).toBeUndefined()
  })

  it("returns the defined signal when the other is missing", () => {
    const controller = new AbortController()

    expect(combineAbortSignals(controller.signal, undefined)).toBe(
      controller.signal,
    )
    expect(combineAbortSignals(undefined, controller.signal)).toBe(
      controller.signal,
    )
  })

  it("aborts when either parent signal aborts", () => {
    const left = new AbortController()
    const right = new AbortController()
    const combined = combineAbortSignals(left.signal, right.signal)

    expect(combined?.aborted).toBe(false)

    right.abort()

    expect(combined?.aborted).toBe(true)
  })

  it("starts aborted when a parent is already aborted", () => {
    const left = new AbortController()
    const right = new AbortController()
    left.abort()

    const combined = combineAbortSignals(left.signal, right.signal)

    expect(combined?.aborted).toBe(true)
  })
})
