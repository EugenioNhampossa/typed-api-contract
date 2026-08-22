# Changelog

All notable changes to this project are documented in this file.

## Unreleased

### Added

- `initClient` options: `headers` (static or thunk), `fetch`, `credentials`, `signal`, `validateRequest`, and `interceptors`.
- Per-call `headers` and `signal` on every route method. Query keys still hash contract args only.
- Client interceptors: `onRequest`, `onResponse`, `onError`. `onError` may return a `ClientResponse` to recover.
- Query hooks forward TanStack Query’s abort signal so cancelled queries abort `fetch`.
- Exported types from `typed-api-contract/client`: `InitClientOptions`, `ClientInterceptor`, `ClientRequest`, `ClientResponse`, `ClientCallArgs`, `TransportArgs`.

### Changed

- Existing `initClient(contract, { baseUrl })` and hook call sites stay valid. New options and call args are additive.
