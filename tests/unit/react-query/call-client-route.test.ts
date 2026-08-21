import { describe, expect, it } from "vitest"
import { callClientRoute } from "../../../src/react-query/callClientRoute"

describe("callClientRoute", () => {
  it("calls a nested client method with the given args", async () => {
    const client = {
      posts: {
        getById: (args: unknown) => Promise.resolve(args),
      },
    }

    await expect(
      callClientRoute(client, ["posts", "getById"], { params: { id: "1" } }),
    ).resolves.toEqual({ params: { id: "1" } })
  })

  it("throws when a path segment is missing", async () => {
    await expect(
      callClientRoute({ posts: {} }, ["posts", "getById"], {}),
    ).rejects.toThrow("Missing client route: posts.getById")
  })

  it("throws when the client itself is not a record", async () => {
    await expect(callClientRoute(null, ["posts"], {})).rejects.toThrow(
      "Missing client route: posts",
    )
  })

  it("throws when the resolved value is not a function", async () => {
    await expect(
      callClientRoute({ posts: { getById: { method: "GET" } } }, ["posts", "getById"], {}),
    ).rejects.toThrow("Missing client route: posts.getById")
  })
})
