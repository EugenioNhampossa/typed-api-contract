import { describe, expect, it } from "vitest"
import { serializeQuery } from "../../../src/client/serializeQuery"
import { serializeQueryBrackets } from "../../../src/client/serializeQueryBrackets"
import { serializeQueryRepeat } from "../../../src/client/serializeQueryRepeat"

describe("serializeQuery", () => {
  it("returns an empty string when query is missing", () => {
    expect(serializeQuery(undefined)).toBe("")
    expect(serializeQuery({})).toBe("")
  })

  it("returns an empty string for null, arrays, and primitives", () => {
    expect(serializeQuery(null)).toBe("")
    expect(serializeQuery(["page", 2])).toBe("")
    expect(serializeQuery("page=2")).toBe("")
    expect(serializeQuery(2)).toBe("")
  })

  it("serializes defined query values", () => {
    expect(serializeQuery({ page: 2 })).toBe("?page=2")
  })

  it("skips undefined query values", () => {
    expect(serializeQuery({ page: undefined, sort: "title" })).toBe("?sort=title")
  })

  it("serializes zero, false, and empty string values", () => {
    expect(serializeQuery({ page: 0 })).toBe("?page=0")
    expect(serializeQuery({ draft: false })).toBe("?draft=false")
    expect(serializeQuery({ q: "" })).toBe("?q=")
  })

  it("encodes reserved characters in keys and values", () => {
    expect(serializeQuery({ "q a": "b&c" })).toBe("?q+a=b%26c")
  })

  it("serializes multiple keys", () => {
    const serialized = serializeQuery({ page: 2, sort: "title" })
    const params = new URLSearchParams(serialized.slice(1))

    expect(params.get("page")).toBe("2")
    expect(params.get("sort")).toBe("title")
  })

  it("skips a query object whose values are all undefined", () => {
    expect(serializeQuery({ page: undefined, sort: undefined })).toBe("")
  })

  it("stringifies arrays with the default scalar serializer", () => {
    expect(serializeQuery({ tags: ["a", "b"] })).toBe("?tags=a%2Cb")
  })
})

describe("serializeQueryRepeat", () => {
  it("repeats keys for array values", () => {
    expect(serializeQueryRepeat({ tags: ["a", "b"], page: 1 })).toBe(
      "?tags=a&tags=b&page=1",
    )
  })

  it("skips undefined values and empty arrays", () => {
    expect(serializeQueryRepeat({ tags: undefined, page: 1 })).toBe("?page=1")
    expect(serializeQueryRepeat({ tags: [] })).toBe("")
  })
})

describe("serializeQueryBrackets", () => {
  it("uses bracket keys for array values", () => {
    expect(serializeQueryBrackets({ tags: ["a", "b"], page: 1 })).toBe(
      "?tags%5B%5D=a&tags%5B%5D=b&page=1",
    )
  })
})
