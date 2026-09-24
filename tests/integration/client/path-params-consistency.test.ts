import { describe, expect, it } from "vitest"
import { z } from "zod"
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { initClient } from "typed-api-contract/client"

describe("initClient path param consistency", () => {
  it("throws when a route path and pathParams disagree", () => {
    const contract = initContract().router({
      getById: {
        method: HTTP_METHOD.GET,
        path: "/posts/:id",
        responses: { 200: z.object({ id: z.string() }) },
      },
    })

    expect(() =>
      initClient(contract, { baseUrl: "http://localhost" }),
    ).toThrow(/no pathParams schema/)
  })
})
