import { describe, expect, it, vi } from "vitest"
import { normalizeClientConfig } from "../../../src/client/normalizeClientConfig"
import type { ClientInterceptor } from "../../../src/client/types/ClientInterceptor"

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

  it("defaults interceptors to an empty list", () => {
    const config = normalizeClientConfig({
      baseUrl: "https://api.example.com",
    })

    expect(config.interceptors).toEqual([])
  })

  it("copies interceptors onto the config", () => {
    const interceptors: ClientInterceptor[] = [
      {
        onRequest(request) {
          return request
        },
      },
    ]
    const config = normalizeClientConfig({
      baseUrl: "https://api.example.com",
      interceptors,
    })

    expect(config.interceptors).toBe(interceptors)
  })

  it("defaults validateRequest to false", () => {
    const config = normalizeClientConfig({
      baseUrl: "https://api.example.com",
    })

    expect(config.validateRequest).toBe(false)
  })

  it("copies signal and validateRequest onto the config", () => {
    const signal = new AbortController().signal
    const config = normalizeClientConfig({
      baseUrl: "https://api.example.com",
      signal,
      validateRequest: true,
    })

    expect(config.signal).toBe(signal)
    expect(config.validateRequest).toBe(true)
  })

  it("defaults querySerializer to scalar serializeQuery", () => {
    const config = normalizeClientConfig({
      baseUrl: "https://api.example.com",
    })

    expect(config.querySerializer({ page: 2 })).toBe("?page=2")
  })

  it("copies a custom querySerializer onto the config", () => {
    const querySerializer = () => "?custom=1"
    const config = normalizeClientConfig({
      baseUrl: "https://api.example.com",
      querySerializer,
    })

    expect(config.querySerializer).toBe(querySerializer)
  })
})
