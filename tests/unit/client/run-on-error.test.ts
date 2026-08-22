import { describe, expect, it, vi } from "vitest"
import { runOnError } from "../../../src/client/runOnError"
import { createExampleRequest } from "../../fixtures/client/create-example-request"

describe("runOnError", () => {
  it("rethrows the original error when there are no interceptors", async () => {
    const error = new Error("network")

    await expect(runOnError([], createExampleRequest(), error)).rejects.toBe(
      error,
    )
  })

  it("runs onError hooks in array order then rethrows", async () => {
    const error = new Error("network")
    const order: number[] = []

    await expect(
      runOnError(
        [
          {
            onError() {
              order.push(1)
            },
          },
          {
            onError() {
              order.push(2)
            },
          },
        ],
        createExampleRequest(),
        error,
      ),
    ).rejects.toBe(error)

    expect(order).toEqual([1, 2])
  })

  it("stops the chain when onError throws", async () => {
    const original = new Error("network")
    const replacement = new Error("mapped")
    const second = vi.fn()

    await expect(
      runOnError(
        [
          {
            onError() {
              throw replacement
            },
          },
          { onError: second },
        ],
        createExampleRequest(),
        original,
      ),
    ).rejects.toBe(replacement)

    expect(second).not.toHaveBeenCalled()
  })
})
