import { describe, expect, it } from "vitest"
import { buildQueryKey } from "typed-api-contract/react-query"

const QUERY_KEY_EMPTY_PART = null

describe("buildQueryKey", () => {
  it("builds a prefix-invalidatable key with params and empty query", () => {
    expect(
      buildQueryKey(["posts", "getById"], { params: { id: "1" } }),
    ).toEqual(["posts", "getById", { id: "1" }, null])
  })

  it("does not collide for two routes with the same params object", () => {
    const params = { id: "1" }
    const getByIdKey = buildQueryKey(["posts", "getById"], { params })
    const getCommentsKey = buildQueryKey(["posts", "comments"], { params })

    expect(getByIdKey).not.toEqual(getCommentsKey)
    expect(getByIdKey.slice(0, 1)).toEqual(["posts"])
    expect(getCommentsKey.slice(0, 1)).toEqual(["posts"])
  })

  it("includes query when present", () => {
    expect(buildQueryKey(["posts", "list"], { query: { page: 2 } })).toEqual([
      "posts",
      "list",
      null,
      { page: 2 },
    ])
  })

  it("uses empty placeholders when args are omitted", () => {
    expect(buildQueryKey(["posts", "list"])).toEqual([
      "posts",
      "list",
      QUERY_KEY_EMPTY_PART,
      QUERY_KEY_EMPTY_PART,
    ])
  })

  it("includes both params and query when both are present", () => {
    expect(
      buildQueryKey(["posts", "search"], {
        params: { locale: "pt" },
        query: { q: "gifim" },
      }),
    ).toEqual(["posts", "search", { locale: "pt" }, { q: "gifim" }])
  })

  it("treats undefined params as an empty placeholder", () => {
    expect(
      buildQueryKey(["posts", "list"], { params: undefined, query: { page: 1 } }),
    ).toEqual(["posts", "list", QUERY_KEY_EMPTY_PART, { page: 1 }])
  })

  it("keeps an empty route path usable as a key", () => {
    expect(buildQueryKey([])).toEqual([
      QUERY_KEY_EMPTY_PART,
      QUERY_KEY_EMPTY_PART,
    ])
  })

  it("distinguishes missing query from an empty query object", () => {
    const missingQuery = buildQueryKey(["posts", "list"], { params: { id: "1" } })
    const emptyQuery = buildQueryKey(["posts", "list"], {
      params: { id: "1" },
      query: {},
    })

    expect(missingQuery).toEqual(["posts", "list", { id: "1" }, null])
    expect(emptyQuery).toEqual(["posts", "list", { id: "1" }, {}])
    expect(missingQuery).not.toEqual(emptyQuery)
  })
})
