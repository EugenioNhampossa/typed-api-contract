---
title: React Query reference
description: Exports from typed-api-contract/react-query.
---

# React Query reference

Import these from `typed-api-contract/react-query`. The module starts with `"use client"`. Behaviour is in the [React Query](../react-query) and [cursor pagination](../pagination) guides.

## Functions

| Export | Role |
| --- | --- |
| `initQueryHooks` | Hook tree. GET is `useQuery`. Other methods are `useMutation`. GET with `infinite` also has `.infinite` |
| `initQueryOptions` | The same keys and functions, for `useQuery`, `prefetchQuery`, and `useInfiniteQuery` |
| `buildQueryKey` | `[...routePath, paramsOrNull, queryOrNull]`. Ignores `headers` and `signal` |

## Types

| Export | Role |
| --- | --- |
| `InferQueryHooks` | The hook tree type for a contract |
| `InferQueryOptions` | The options tree type for a contract |
| `ContractClientError` | `UnexpectedStatusError`, `AuthUnauthorizedError`, `ZodError`, or `Error` |
