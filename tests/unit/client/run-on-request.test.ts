import { describe, expect, it, vi } from "vitest"
import { runOnRequest } from "../../../src/client/runOnRequest"
import { createExampleRequest } from "../../fixtures/client/create-example-request"

describe("runOnRequest", () => {
  it("returns the request unchanged when there are no interceptors", async () => {
    const request = createExampleRequest()

    await expect(runOnRequest([], request)).resolves.toBe(request)
  })

  it("runs onRequest hooks in array order", async () => {
    const order: number[] = []

    const intercepted = await runOnRequest(
      [
        {
          onRequest(request) {
            order.push(1)
            request.headers.set("X-Order", "1")
            return request
          },
        },
        {
          onRequest(request) {
            order.push(2)
            request.headers.set("X-Order", "2")
            return request
          },
        },
      ],
      createExampleRequest(),
    )

    expect(order).toEqual([1, 2])
    expect(intercepted.headers.get("X-Order")).toBe("2")
  })

  it("threads a replaced URL from onRequest", async () => {
    const intercepted = await runOnRequest(
      [
        {
          onRequest(request) {
            return { ...request, url: "https://api.example.com/rewritten" }
          },
        },
      ],
      createExampleRequest(),
    )

    expect(intercepted.url).toBe("https://api.example.com/rewritten")
  })

  it("skips interceptors without onRequest", async () => {
    const onRequest = vi.fn((request: ReturnType<typeof createExampleRequest>) => request)

    await runOnRequest(
      [{ onError() {} }, { onRequest }],
      createExampleRequest(),
    )

    expect(onRequest).toHaveBeenCalledOnce()
  })
})
