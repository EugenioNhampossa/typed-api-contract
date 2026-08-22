import { describe, expect, it } from "vitest"
import { z, ZodError } from "zod"
import { HTTP_METHOD } from "typed-api-contract"
import { validateRequestArgs } from "../../../src/client/validateRequestArgs"

const createRoute = {
  method: HTTP_METHOD.POST,
  path: "/posts",
  body: z.object({ title: z.string(), body: z.string() }),
  responses: {
    201: z.object({ id: z.string() }),
  },
}

const getByIdRoute = {
  method: HTTP_METHOD.GET,
  path: "/posts/:id",
  pathParams: z.object({ id: z.string() }),
  responses: {
    200: z.object({ id: z.string() }),
  },
}

describe("validateRequestArgs", () => {
  it("accepts args that match the route schemas", () => {
    expect(() =>
      validateRequestArgs(createRoute, {
        body: { title: "Hello", body: "World" },
      }),
    ).not.toThrow()
  })

  it("throws ZodError when the body does not match", () => {
    expect(() =>
      validateRequestArgs(createRoute, {
        body: { title: 1, body: "World" },
      } as never),
    ).toThrow(ZodError)
  })

  it("throws ZodError when path params do not match", () => {
    expect(() =>
      validateRequestArgs(getByIdRoute, { params: { id: 1 } } as never),
    ).toThrow(ZodError)
  })

  it("skips fields that the route does not declare", () => {
    expect(() =>
      validateRequestArgs(getByIdRoute, { params: { id: "1" } }),
    ).not.toThrow()
  })
})
