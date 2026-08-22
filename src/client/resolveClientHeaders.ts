import type { InitClientOptions } from "./types/InitClientOptions.js"

function isHeadersThunk(
  headers: NonNullable<InitClientOptions["headers"]>,
): headers is () => HeadersInit | Promise<HeadersInit> {
  return typeof headers === "function"
}

/**
 * Resolves client-level headers, awaiting a thunk when one is provided.
 */
export async function resolveClientHeaders(
  headers: InitClientOptions["headers"],
): Promise<HeadersInit | undefined> {
  if (headers === undefined) {
    return undefined
  }

  if (isHeadersThunk(headers)) {
    return headers()
  }

  return headers
}
