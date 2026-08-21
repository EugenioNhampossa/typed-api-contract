import { describe, expect, it } from "vitest"
import { HTTP_METHOD, isAppRoute } from "typed-api-contract"

describe("isAppRoute", () => {
  it("returns true for an object with method, path, and responses", () => {
    const route = {
      method: HTTP_METHOD.GET,
      path: "/posts/:id",
      responses: { 200: {} },
    }

    expect(isAppRoute(route)).toBe(true)
  })

  it.each(Object.values(HTTP_METHOD))(
    "returns true for HTTP method %s",
    (method) => {
      expect(
        isAppRoute({
          method,
          path: "/posts",
          responses: { 200: {} },
        }),
      ).toBe(true)
    },
  )

  it("returns true when a valid route has extra fields", () => {
    expect(
      isAppRoute({
        method: HTTP_METHOD.POST,
        path: "/posts",
        responses: { 201: {} },
        summary: "create post",
      }),
    ).toBe(true)
  })

  it("returns false for a nested router without a method", () => {
    const nestedRouter = {
      getById: {
        method: HTTP_METHOD.GET,
        path: "/posts/:id",
        responses: { 200: {} },
      },
    }

    expect(isAppRoute(nestedRouter)).toBe(false)
  })

  it("returns false for null and non-objects", () => {
    expect(isAppRoute(null)).toBe(false)
    expect(isAppRoute(undefined)).toBe(false)
    expect(isAppRoute("/posts")).toBe(false)
    expect(isAppRoute(200)).toBe(false)
    expect(isAppRoute(true)).toBe(false)
  })

  it("returns false for arrays even when they look like routes", () => {
    expect(
      isAppRoute([
        {
          method: HTTP_METHOD.GET,
          path: "/posts",
          responses: { 200: {} },
        },
      ]),
    ).toBe(false)
  })

  it("returns false when method is not an HTTP method", () => {
    const route = {
      method: "FETCH",
      path: "/posts",
      responses: { 200: {} },
    }

    expect(isAppRoute(route)).toBe(false)
  })

  it("returns false for a lowercase HTTP method", () => {
    expect(
      isAppRoute({
        method: "get",
        path: "/posts",
        responses: { 200: {} },
      }),
    ).toBe(false)
  })

  it("returns false when path or responses are missing", () => {
    expect(
      isAppRoute({ method: HTTP_METHOD.GET, responses: { 200: {} } }),
    ).toBe(false)
    expect(isAppRoute({ method: HTTP_METHOD.GET, path: "/posts" })).toBe(false)
  })

  it("returns false when path is not a string", () => {
    expect(
      isAppRoute({
        method: HTTP_METHOD.GET,
        path: 404,
        responses: { 200: {} },
      }),
    ).toBe(false)
  })

  it("returns false when responses is null", () => {
    expect(
      isAppRoute({
        method: HTTP_METHOD.GET,
        path: "/posts",
        responses: null,
      }),
    ).toBe(false)
  })

  it("returns false for an empty object", () => {
    expect(isAppRoute({})).toBe(false)
  })
})
