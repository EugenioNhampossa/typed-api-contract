import type { ClientResponse } from "../../../src/client/types/ClientInterceptor"

export function createExampleResponse(
  overrides: Partial<ClientResponse> = {},
): ClientResponse {
  const raw = new Response("{}", { status: 200 })

  return {
    status: 200,
    body: {},
    headers: raw.headers,
    raw,
    ...overrides,
  }
}
