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
      true,
    )

    expect(result).toEqual({ status: 200, body: { id: "1" } })
  })

  it("throws UnexpectedStatusError for an undeclared status", () => {
    expect(() =>
      parseRouteResponse(
        getByIdRoute,
        createExampleResponse({ status: 500, body: { message: "error" } }),
        false,
      ),
    ).toThrow(UnexpectedStatusError)
  })

  it("throws ZodError when validation is on and the body does not match", () => {
    expect(() =>
      parseRouteResponse(
        getByIdRoute,
        createExampleResponse({ status: 200, body: { id: 1 } }),
        true,
      ),
    ).toThrow(ZodError)
  })

  it("returns the raw body when validation is off", () => {
    const body = { id: 1, extra: "kept" }

    const result = parseRouteResponse(
      getByIdRoute,
      createExampleResponse({ status: 200, body }),
      false,
    )

    expect(result).toEqual({ status: 200, body })
  })

  it("accepts an empty body when the schema is z.undefined()", () => {
    const route = {
      method: HTTP_METHOD.DELETE,
      path: "/posts/:id",
      pathParams: z.object({ id: z.string() }),
      responses: { 204: z.undefined() },
    }

    const result = parseRouteResponse(
      route,
      createExampleResponse({ status: 204, body: undefined }),
      true,
    )

    expect(result).toEqual({ status: 204, body: undefined })
  })

  it("accepts an empty body when the schema is z.void()", () => {
    const route = {
      method: HTTP_METHOD.DELETE,
      path: "/posts/:id",
      pathParams: z.object({ id: z.string() }),
      responses: { 204: z.void() },
    }

    const result = parseRouteResponse(
      route,
      createExampleResponse({ status: 204, body: undefined }),
      true,
    )

    expect(result.status).toBe(204)
  })
})
