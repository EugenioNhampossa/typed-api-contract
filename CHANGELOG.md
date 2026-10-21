# Changelog

All notable changes to this project are documented in this file.

## Unreleased

### Changed

- Response bodies are Zod-parsed only when `validateResponse` is `true`. The default is `false`, matching `validateRequest`. A status missing from `responses` still throws `UnexpectedStatusError`.

## 0.3.0

### Added

- Route `contentType: "multipart"` with `FormData` encoding (plain object or `FormData` body). JSON remains the default.
- `querySerializer` on `initClient`, plus exported `serializeQuery`, `serializeQueryRepeat`, and `serializeQueryBrackets`.
- Path `:param` vs `pathParams` consistency checks at `initClient`.
- Empty / void response bodies (`z.undefined()` / `z.void()`) and JSON bodies on DELETE when declared.
- `onError` context `retry()` (one retry per call) and `createAuthRefreshInterceptor` (401 refresh + single-flight).
- `initQueryOptions` tree for prefetch/SSR; hooks share the same key/fn builders.
- Opt-in GET `infinite` config; `.infinite` on hooks and options.
- Exported `ContractClientError`, `AuthUnauthorizedError`, `ClientErrorContext`, `QuerySerializer`, `InfiniteRouteConfig`.

### Changed

- Existing `initClient(contract, { baseUrl })` and hook call sites stay valid. New options are additive.
- Default query encoding and `validateRequest: false` are unchanged.

## 0.2.0

### Added

- `initClient` options: `headers` (static or thunk), `fetch`, `credentials`, `signal`, `validateRequest`, and `interceptors`.
- Per-call `headers` and `signal` on every route method. Query keys still hash contract args only.
- Client interceptors: `onRequest`, `onResponse`, `onError`. `onError` may return a `ClientResponse` to recover.
- Query hooks forward TanStack Query’s abort signal so cancelled queries abort `fetch`.
- Exported types from `typed-api-contract/client`: `InitClientOptions`, `ClientInterceptor`, `ClientRequest`, `ClientResponse`, `ClientCallArgs`, `TransportArgs`.

### Changed

- Existing `initClient(contract, { baseUrl })` and hook call sites stay valid. New options and call args are additive.
