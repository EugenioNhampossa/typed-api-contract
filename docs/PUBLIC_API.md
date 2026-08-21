# Public API (frozen)

This is the **Phase 0 freeze**. Anything not listed here is internal and must not be imported by consumers.

No new features are in scope until this list is revised in a minor/major release.

Runtime modules are ESM-only (`"type": "module"`). Subpath exports:

| Package entry | Built files |
|---|---|
| `typed-api-contract` | `dist/contract/index.js` + `.d.ts` |
| `typed-api-contract/client` | `dist/client/index.js` + `.d.ts` |
| `typed-api-contract/react-query` | `dist/react-query/index.js` + `.d.ts` |

---

## `typed-api-contract`

### Values

| Export | Kind |
|---|---|
| `initContract` | function |
| `isAppRoute` | function (type guard) |
| `HTTP_METHOD` | `as const` object |

```ts
initContract(): {
  router<const T extends AppRouter>(routes: T): T
}

isAppRoute(value: unknown): value is AppRoute

HTTP_METHOD: {
  GET: "GET"
  POST: "POST"
  PUT: "PUT"
  PATCH: "PATCH"
  DELETE: "DELETE"
}
```

### Types

| Export | Meaning |
|---|---|
| `AppRoute` | One HTTP route: method, path, optional Zod `pathParams` / `query` / `body`, `responses` |
| `AppRouter` | Nested `{ [key]: AppRoute \| AppRouter }` |
| `HttpMethod` | `"GET" \| "POST" \| "PUT" \| "PATCH" \| "DELETE"` |
| `GetHttpMethod` | `"GET"` — used to map GET → query hook |
| `InferBody<R>` | `z.infer` of `R.body`, or `never` |
| `InferQuery<R>` | `z.infer` of `R.query`, or `never` |
| `InferPathParams<R>` | `z.infer` of `R.pathParams`, or `never` |
| `InferClientArgs<R>` | `{ params?, query?, body? }` with required keys only when the schema exists |
| `InferResponses<R>` | Discriminated union `{ status; body }` for each declared status |

---

## `typed-api-contract/client`

### Values

| Export | Kind |
|---|---|
| `initClient` | function |
| `buildPath` | function |
| `UnexpectedStatusError` | class extending `Error` |

```ts
initClient<T extends AppRouter>(
  contract: T,
  options: { baseUrl: string },
): InferClient<T>

buildPath(path: string, pathParams: unknown): string

class UnexpectedStatusError extends Error {
  readonly method: HttpMethod
  readonly path: string
  readonly status: number
}
```

### Types

| Export | Meaning |
|---|---|
| `InferClient<T>` | Recursive client tree. Leaves are `(args: InferClientArgs<R>) => Promise<InferResponses<R>>` |

`InitClientOptions` is **not** exported. Pass the object inline.

---

## `typed-api-contract/react-query`

The entry file must retain the `"use client"` directive for Next.js App Router.

### Values

| Export | Kind |
|---|---|
| `initQueryHooks` | function |
| `buildQueryKey` | function |

```ts
initQueryHooks<T extends AppRouter>(
  contract: T,
  client: InferClient<T>,
): InferQueryHooks<T>

buildQueryKey(
  routePath: readonly string[],
  args?: { params?: unknown; query?: unknown },
): readonly [...string[], unknown, unknown]
```

GET routes become `useQuery` hooks: `(args, options?) => UseQueryResult`.

POST / PUT / PATCH / DELETE become `useMutation` hooks: `(options?) => UseMutationResult`.

### Types

| Export | Meaning |
|---|---|
| `InferQueryHooks<T>` | Recursive hook tree matching `InferClient`, with GET vs mutation split |

---

## Explicitly internal (do not export)

These exist in source for implementation and tests. They are **not** part of the npm surface:

- `callRoute`, `createClientTree`, `createRouteCaller`
- `serializeQuery`, `parseResponseJson`, `isZodSchema`, `isRecord`, `getRecordValue`
- `HEADER_CONTENT_TYPE`, `CONTENT_TYPE_JSON`, `JSON_BODY_METHODS`
- `createQueryHook`, `createMutationHook`, `createRouteHook`, `createQueryHooksTree`
- `callClientRoute`, `QUERY_KEY_EMPTY_PART`
- `ContractInit`, `InitClientOptions`, `QueryKeyArgs`

---

## Frozen v1 behaviour (not new features)

Changing any of these is a breaking change after `1.0.0` (or a minor bump while `0.x` if documented):

1. GET → query hook; every other method → mutation hook.
2. Declared statuses (including 4xx) are **data**. Undeclared statuses throw `UnexpectedStatusError`.
3. Response bodies are Zod-parsed. Drift throws `ZodError`.
4. Request `params` / `query` / `body` are TypeScript-only — not parsed at runtime.
5. JSON body is sent only for POST / PUT / PATCH. GET never sends a body.
6. `initClient` options are `{ baseUrl }` only.
7. Query serialization is flat (`String(value)`). Path params use `:name` + `encodeURIComponent`.
