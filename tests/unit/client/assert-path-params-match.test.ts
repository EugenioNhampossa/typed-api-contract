import { describe, expect, it } from "vitest"
import { z } from "zod"
import { HTTP_METHOD } from "typed-api-contract"
import { assertPathParamsMatch } from "../../../src/client/assertPathParamsMatch"

describe("assertPathParamsMatch", () => {
  it("allows a path with matching pathParams", () => {
    expect(() =>
      assertPathParamsMatch({
        method: HTTP_METHOD.GET,
        path: "/posts/:id",
        pathParams: z.object({ id: z.string() }),
        responses: { 200: z.object({ id: z.string() }) },
      }),
    ).not.toThrow()
  })

  it("allows a path with no params and no schema", () => {
    expect(() =>
      assertPathParamsMatch({
        method: HTTP_METHOD.GET,
        path: "/posts",
        responses: { 200: z.array(z.string()) },
      }),
    ).not.toThrow()
  })

  it("throws when the path has params but pathParams is missing", () => {
    expect(() =>
      assertPathParamsMatch({
        method: HTTP_METHOD.GET,
        path: "/posts/:id",
        responses: { 200: z.object({ id: z.string() }) },
      }),
    ).toThrow(/no pathParams schema/)
  })

  it("throws when a path param is missing from the schema", () => {
    expect(() =>
      assertPathParamsMatch({
        method: HTTP_METHOD.GET,
        path: "/posts/:id/comments/:commentId",
        pathParams: z.object({ id: z.string() }),
        responses: { 200: z.object({}) },
      }),
    ).toThrow(/commentId/)
  })

  it("throws when a schema key is missing from the path", () => {
    expect(() =>
      assertPathParamsMatch({
        method: HTTP_METHOD.GET,
        path: "/posts/:id",
        pathParams: z.object({ id: z.string(), slug: z.string() }),
        responses: { 200: z.object({}) },
      }),
    ).toThrow(/slug/)
  })
})
