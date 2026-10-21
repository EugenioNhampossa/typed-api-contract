---
title: Client reference
description: Exports from typed-api-contract/client.
---

# Client reference

Import these from `typed-api-contract/client`. Behaviour is in the [client](../client), [responses](../responses), [interceptors](../interceptors), and [auth](../auth) guides.

## Functions

| Export | Role |
| --- | --- |
| `initClient` | Builds a fetch client whose keys match the contract |
| `createAuthRefreshInterceptor` | Refreshes on 401 (or `isUnauthorized`) and retries once |
| `buildPath` | Replaces `:param` with `encodeURIComponent` values. A missing key stays as `:param` |
| `serializeQuery` | Default query string. Arrays become one comma-joined value |
| `serializeQueryRepeat` | Arrays become repeated keys: `tags=a&tags=b` |
| `serializeQueryBrackets` | Arrays become bracket keys: `tags[]=a&tags[]=b` (brackets are percent-encoded) |

## Classes

| Export | Role |
| --- | --- |
| `UnexpectedStatusError` | Status was not declared. Fields: `method`, `path`, `status` |
| `AuthUnauthorizedError` | Refresh retry is still unauthorized. Field: `response` |

## Types

| Export | Role |
| --- | --- |
| `InitClientOptions` | `baseUrl` and the optional client settings |
| `ClientInterceptor` | `onRequest`, `onResponse`, `onError` |
| `ClientRequest` | URL, method, headers, body, signal, and the route, after the client has built the call |
| `ClientResponse` | `status`, `body`, `headers`, and the raw `Response` |
| `ClientErrorContext` | `retry()`, which re-runs the call once |
| `ClientCallArgs` | Contract args plus optional `headers` and `signal` |
| `TransportArgs` | The `headers` and `signal` half of `ClientCallArgs` |
| `QuerySerializer` | `(query: Record<string, unknown>) => string`, including the leading `?` |
| `InferClient` | The function tree `initClient` returns for a contract |
| `CreateAuthRefreshInterceptorOptions` | `refresh`, optional `getAccessToken`, optional `isUnauthorized` |
