import { describe, expect, it, vi } from "vitest"
import { runOnError } from "../../../src/client/runOnError"
import { createExampleRequest } from "../../fixtures/client/create-example-request"
import { createExampleResponse } from "../../fixtures/client/create-example-response"

function createErrorContext(
  retry = vi.fn(async () => createExampleResponse()),
) {
  return { retry }
}

describe("runOnError", () => {
  it("rethrows the original error when there are no interceptors", async () => {
    const error = new Error("network")

    await expect(
      runOnError([], createExampleRequest(), error, createErrorContext()),
    ).rejects.toBe(error)
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
        createErrorContext(),
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
        createErrorContext(),
      ),
    ).rejects.toBe(replacement)

    expect(second).not.toHaveBeenCalled()
  })

  it("returns a ClientResponse from onError and skips later hooks", async () => {
    const recovered = createExampleResponse({
      body: { id: "1" },
    })
    const second = vi.fn()

    const result = await runOnError(
      [
        {
          onError() {
            return recovered
          },
        },
        { onError: second },
      ],
      createExampleRequest(),
      new Error("network"),
      createErrorContext(),
    )

    expect(result).toBe(recovered)
    expect(second).not.toHaveBeenCalled()
  })

  it("lets a later hook recover when earlier hooks return void", async () => {
    const recovered = createExampleResponse()

    const result = await runOnError(
      [
        {
          onError() {
            return undefined
          },
        },
        {
          onError() {
            return recovered
          },
        },
      ],
      createExampleRequest(),
      new Error("network"),
      createErrorContext(),
    )

    expect(result).toBe(recovered)
  })

  it("passes retry on the error context", async () => {
    const retry = vi.fn(async () => createExampleResponse())
    const recovered = createExampleResponse({ body: { ok: true } })

    const result = await runOnError(
      [
        {
          async onError(_request, _error, ctx) {
            await ctx.retry()
            return recovered
          },
        },
      ],
      createExampleRequest(),
      new Error("network"),
      { retry },
    )

    expect(retry).toHaveBeenCalledOnce()
    expect(result).toBe(recovered)
  })
})
