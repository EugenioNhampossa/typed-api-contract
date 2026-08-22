import { describe, expect, it } from "vitest"
import { z, ZodError } from "zod"
import { HTTP_METHOD } from "typed-api-contract"
import { UnexpectedStatusError } from "typed-api-contract/client"
import { parseRouteResponse } from "../../../src/client/parseRouteResponse"
import { createExampleResponse } from "../../fixtures/client/create-example-response"

const getByIdRoute = {
  method: HTTP_METHOD.GET,
  path: "/posts/:id",
  pathParams: z.object({ id: z.string() }),
  responses: {
    200: z.object({ id: z.string() }),
  },
}

describe("parseRouteResponse", () => {
  it("returns a validated body for a declared status", () => {
    const result = parseRouteResponse(
      getByIdRoute,
      createExampleResponse({
        status: 200,
        body: { id: "1" },
      }),
    )

    expect(result).toEqual({ status: 200, body: { id: "1" } })
  })

  it("throws UnexpectedStatusError for an undeclared status", () => {
    expect(() =>
      parseRouteResponse(
        getByIdRoute,
        createExampleResponse({ status: 500, body: { message: "error" } }),
      ),
    ).toThrow(UnexpectedStatusError)
  })

  it("throws ZodError when the body does not match the schema", () => {
    expect(() =>
      parseRouteResponse(
        getByIdRoute,
        createExampleResponse({ status: 200, body: { id: 1 } }),
      ),
    ).toThrow(ZodError)
  })
})
