import { parseResponseJson } from "./parseResponseJson.js"
import type { ClientResponse } from "./types/ClientInterceptor.js"

/**
 * Reads the wire body as JSON (or `undefined` when empty) without Zod parsing.
 */
export async function mapFetchResponse(
  response: Response,
): Promise<ClientResponse> {
  const body = await parseResponseJson(response)

  return {
    status: response.status,
    body,
    headers: response.headers,
    raw: response,
  }
}
