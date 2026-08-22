import { describe, expect, it, vi } from "vitest"
import { normalizeClientConfig } from "../../../src/client/normalizeClientConfig"

describe("normalizeClientConfig", () => {
  it("copies baseUrl onto the config", () => {
    const config = normalizeClientConfig({
      baseUrl: "https://api.example.com",
    })

    expect(config.baseUrl).toBe("https://api.example.com")
  })

  it("defaults fetch to globalThis.fetch at call time", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }))

    const config = normalizeClientConfig({
      baseUrl: "https://api.example.com",
    })

    try {
      await config.fetch("https://api.example.com/posts")

      expect(fetchSpy).toHaveBeenCalledWith(
        "https://api.example.com/posts",
        undefined,
      )
    } finally {
      fetchSpy.mockRestore()
    }
  })

  it("uses the provided fetch implementation", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response("{}", { status: 200 }))

    const config = normalizeClientConfig({
      baseUrl: "https://api.example.com",
      fetch,
    })

    await config.fetch("https://api.example.com/posts")

    expect(fetch).toHaveBeenCalledOnce()
    expect(fetch.mock.calls[0]?.[0]).toBe("https://api.example.com/posts")
  })

  it("copies headers and credentials onto the config", () => {
    const headers = { Authorization: "Bearer a" }
    const config = normalizeClientConfig({
      baseUrl: "https://api.example.com",
      headers,
      credentials: "include",
    })

    expect(config.headers).toBe(headers)
    expect(config.credentials).toBe("include")
  })
})
