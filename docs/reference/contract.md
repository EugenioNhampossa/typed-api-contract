---
title: Contract reference
description: Exports from typed-api-contract.
---

# Contract reference

Import these from `typed-api-contract`. Behaviour is in the [contract guide](../contract).

## Functions

| Export | Role |
| --- | --- |
| `initContract` | Returns `router()`, which checks an `AppRouter` and keeps literal keys |
| `isAppRoute` | `true` when a value has a known `method`, a string `path`, and `responses`. Does not parse Zod schemas |

## Values

| Export | Role |
| --- | --- |
| `HTTP_METHOD` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |

## Types

| Export | Role |
| --- | --- |
| `AppRoute` | One endpoint: method, path, optional inputs, `responses` |
| `AppRouter` | Nested map of routes and routers |
| `HttpMethod` | A member of `HTTP_METHOD` |
| `GetHttpMethod` | The `"GET"` method. GET routes become queries |
| `RouteContentType` | `"json"` or `"multipart"` |
| `InfiniteRouteConfig` | `initialPageParam` and `getNextPageParam` for a GET route |
| `InferPathParams` | `params` type for a route, or `never` when there is no `pathParams` |
| `InferQuery` | `query` type for a route, or `never` when there is no `query` |
| `InferBody` | `body` type for a route, or `never` when there is no `body` |
| `InferClientArgs` | `params`, `query`, and `body` as required keys only when that schema exists |
| `InferResponses` | Union of `{ status, body }` for each declared status |

`InferClientArgs` does not include `headers` or `signal`. Those are added by the client as `ClientCallArgs`.
