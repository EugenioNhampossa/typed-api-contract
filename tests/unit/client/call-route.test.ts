import { describe, expect, it, vi } from "vitest"
import { z, ZodError } from "zod"
import { HTTP_METHOD } from "typed-api-contract"
import { callRoute } from "../../../src/client/callRoute"
import { serializeQuery } from "../../../src/client/serializeQuery"
import type { ClientConfig } from "../../../src/client/types/ClientConfig"

const getByIdRoute = {
  method: HTTP_METHOD.GET,
  path: "/posts/:id",
  pathParams: z.object({ id: z.string() }),
  responses: {
    200: z.object({ id: z.string() }),
  },
}

function createConfig(
  overrides: Partial<ClientConfig> & Pick<ClientConfig, "fetch">,
): ClientConfig {
  return {
    baseUrl: "https://api.example.com",
    interceptors: [],
    validateRequest: false,
    querySerializer: (query) => serializeQuery(query),
    ...overrides,
  }
}

describe("callRoute", () => {
  it("calls config.fetch with the interpolated URL", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(JSON.stringify({ id: "1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )
    const config = createConfig({ fetch })

    const result = await callRoute({
      config,
      route: getByIdRoute,
      args: { params: { id: "1" } },
    })

    expect(fetch).toHaveBeenCalledOnce()
    expect(fetch.mock.calls[0]?.[0]).toBe("https://api.example.com/posts/1")
    expect(result).toEqual({ status: 200, body: { id: "1" } })
  })

  it("forwards signal and credentials to fetch", async () => {
    const signal = new AbortController().signal
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(JSON.stringify({ id: "1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    await callRoute({
      config: createConfig({ fetch, credentials: "include" }),
      route: getByIdRoute,
      args: { params: { id: "1" }, signal },
    })

    expect(fetch.mock.calls[0]?.[1]).toMatchObject({
      signal,
      credentials: "include",
    })
  })

  it("forwards the client-level signal when no per-call signal is set", async () => {
    const signal = new AbortController().signal
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(JSON.stringify({ id: "1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    await callRoute({
      config: createConfig({ fetch, signal }),
      route: getByIdRoute,
      args: { params: { id: "1" } },
    })

    expect(fetch.mock.calls[0]?.[1]?.signal).toBe(signal)
  })

  it("does not call fetch when validateRequest fails", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>()

    await expect(
      callRoute({
        config: createConfig({ fetch, validateRequest: true }),
        route: getByIdRoute,
        args: { params: { id: 1 } } as never,
      }),
    ).rejects.toThrow(ZodError)

    expect(fetch).not.toHaveBeenCalled()
  })
})
