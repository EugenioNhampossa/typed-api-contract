/**
 * Options passed to `initClient`.
 *
 * `baseUrl` is the API origin with no trailing slash, e.g. `https://api.example.com`.
 */
export interface InitClientOptions {
  baseUrl: string
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>)
  fetch?: typeof fetch
  credentials?: RequestCredentials
}
