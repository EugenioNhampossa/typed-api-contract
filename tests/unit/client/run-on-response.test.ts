import { describe, expect, it } from "vitest"
import { runOnResponse } from "../../../src/client/runOnResponse"
import { createExampleRequest } from "../../fixtures/client/create-example-request"
import { createExampleResponse } from "../../fixtures/client/create-example-response"

describe("runOnResponse", () => {
  it("returns the response unchanged when there are no interceptors", async () => {
    const request = createExampleRequest()
    const response = createExampleResponse()

    await expect(runOnResponse([], request, response)).resolves.toBe(response)
  })

  it("runs onResponse hooks in array order", async () => {
    const order: number[] = []
    const intercepted = await runOnResponse(
      [
        {
          onResponse(_request, response) {
            order.push(1)
            return { ...response, status: 201 }
          },
        },
        {
          onResponse(_request, response) {
            order.push(2)
            return { ...response, body: { via: order.slice() } }
          },
        },
      ],
      createExampleRequest(),
      createExampleResponse(),
    )

    expect(order).toEqual([1, 2])
    expect(intercepted.status).toBe(201)
    expect(intercepted.body).toEqual({ via: [1, 2] })
  })
})
