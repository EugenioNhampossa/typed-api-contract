# typed-api-contract

Typed REST contracts, a `fetch` client, and TanStack Query hooks inferred from Zod route definitions.

## Install

```bash
npm i typed-api-contract zod
# optional, only if you use the React Query entry:
npm i react @tanstack/react-query
```

Peer dependencies: `zod` `^4`. `react` and `@tanstack/react-query` `^5` are optional and required only for `typed-api-contract/react-query`.

## Entries

| Import                           | Purpose                                                |
| -------------------------------- | ------------------------------------------------------ |
| `typed-api-contract`             | Define routes with `initContract`                      |
| `typed-api-contract/client`      | Typed `fetch` client from a contract                   |
| `typed-api-contract/react-query` | `useQuery` / `useMutation` / options from the contract |

## Usage

```ts
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { initClient } from "typed-api-contract/client"
import { initQueryHooks, initQueryOptions } from "typed-api-contract/react-query"
import { z } from "zod"

const postsContract = initContract().router({
  list: {
    method: HTTP_METHOD.GET,
    path: "/posts",
    responses: { 200: z.array(z.object({ id: z.string(), title: z.string() })) },
  },
})

const postsClient = initClient(postsContract, { baseUrl: "https://api.example.com" })
const postsHooks = initQueryHooks(postsContract, postsClient)
const postsOptions = initQueryOptions(postsContract, postsClient)
```

Mount a TanStack `QueryClientProvider` in the app. This package does not provide one.

Next.js App Router: `typed-api-contract/react-query` ships with `"use client"` so hooks can be imported from Client Components. Interceptors and the rest of `typed-api-contract/client` are plain TypeScript and work in Node 18+ and the browser.

## Client options

`initClient(contract, { baseUrl })` still works. Optional fields:

```ts
import {
  initClient,
  serializeQueryRepeat,
  type ClientInterceptor,
} from "typed-api-contract/client"

const authInterceptor: ClientInterceptor = {
  async onRequest(request) {
    request.headers.set("Authorization", `Bearer ${await getAccessToken()}`)
    return request
  },
  onResponse(_request, response) {
    return response
  },
  onError(_request, error) {
    throw error
  },
}

const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
  headers: { "X-App": "web" },
  fetch: customFetch,
  credentials: "include",
  signal: pageAbort.signal,
  validateRequest: true,
  querySerializer: serializeQueryRepeat,
  interceptors: [authInterceptor],
})
```

| Option             | Role |
| ------------------ | ---- |
| `baseUrl`          | API origin with no trailing slash |
| `headers`          | Static headers, or a thunk (sync or async) resolved on every request |
| `fetch`            | Custom `fetch`. Defaults to `globalThis.fetch` at call time |
| `credentials`      | Forwarded as `RequestInit.credentials` |
| `signal`           | Aborts every request; combined with a per-call `signal` when both are set |
| `validateRequest`  | When `true`, Zod-parses `params` / `query` / `body` before `fetch`. Default `false` |
| `querySerializer`  | Turns `query` into a `?…` string. Default is scalar `serializeQuery`. Also export `serializeQueryRepeat` and `serializeQueryBrackets` |
| `interceptors`     | `onRequest` / `onResponse` / `onError` hooks (see below) |

`initClient` asserts that every `:param` in a route path matches the `pathParams` Zod object keys (and vice versa).

Every route caller also accepts optional `headers` and `signal`. They are not part of the contract and are ignored by query keys.

```ts
await postsClient.list({
  headers: { "X-Request-Id": requestId },
  signal: controller.signal,
})
```

Header merge order (later wins): JSON `Content-Type` when a JSON body is sent → client `headers` → per-call `headers` → `onRequest` mutations. Multipart bodies never set `Content-Type` (the runtime supplies the boundary).

Query hooks forward TanStack Query’s abort signal, so unmounting a query cancels the in-flight `fetch`.

## Multipart uploads

```ts
upload: {
  method: HTTP_METHOD.POST,
  path: "/uploads",
  contentType: "multipart",
  body: z.object({ title: z.string(), file: z.custom<File>() }),
  responses: { 201: z.object({ id: z.string() }) },
}
```

Pass a plain object (built into `FormData`) or a ready `FormData` instance. After success, invalidate with `buildQueryKey` / `initQueryOptions` keys.

## Auth refresh

```ts
import { createAuthRefreshInterceptor, initClient } from "typed-api-contract/client"

const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
  interceptors: [
    createAuthRefreshInterceptor({
      getAccessToken: () => accessToken,
      refresh: async () => {
        accessToken = await refreshAccessToken()
      },
    }),
  ],
})
```

On 401, the interceptor refreshes once (single-flight across concurrent calls) and `retry()`s the request. A second 401 is not retried.

## Query options and infinite queries

```ts
import { useQuery } from "@tanstack/react-query"
import { initQueryOptions } from "typed-api-contract/react-query"

const options = initQueryOptions(postsContract, postsClient)

useQuery(options.posts.list({ query: {} }))
await queryClient.prefetchQuery(options.posts.getById({ params: { id } }))
```

For cursor lists, set `infinite` on a GET route. Page params must be plain objects merged into `query` (e.g. `{ cursor }`):

```ts
list: {
  method: HTTP_METHOD.GET,
  path: "/posts",
  query: z.object({ cursor: z.string().optional() }),
  responses: { 200: pageSchema },
  infinite: {
    initialPageParam: {},
    getNextPageParam: (lastPage) => {
      const page = lastPage as { status: number; body: { nextCursor: string | null } }
      return page.status === 200 && page.body.nextCursor
        ? { cursor: page.body.nextCursor }
        : undefined
    },
  },
}

hooks.posts.list.infinite({ query: {} })
options.posts.list.infinite({ query: {} })
```

## Interceptors

Each call runs:

```
build request → onRequest → fetch → map body → onResponse → Zod / status check
```

`onResponse` sees the wire result, including undeclared statuses, **before** `UnexpectedStatusError`. Zod still owns validation after the interceptor chain.

If `fetch`, JSON parse, or status/Zod validation fails, `onError` runs in array order:

- `throw` (or rethrow) stops the chain.
- `return` a `ClientResponse` to recover. That response is Zod-parsed once and does **not** go through `onError` again.
- `ctx.retry(request?)` re-runs `onRequest` → fetch → `onResponse` **once** for this call (used by auth refresh).

```ts
const recoverOnNetworkError: ClientInterceptor = {
  async onError(_request, error, _ctx) {
    if (!(error instanceof TypeError)) {
      throw error
    }

    return {
      status: 200,
      body: fallbackBody,
      headers: new Headers(),
      raw: new Response(),
    }
  },
}
```

## Behaviour notes

- Declared HTTP statuses (including 4xx) are data. Undeclared statuses throw `UnexpectedStatusError`.
- Request `params` / `query` / `body` are typed. They are parsed at runtime only when `validateRequest` is `true`. Responses are always Zod-parsed.
- Empty responses work with `z.undefined()` / `z.void()` (e.g. 204).
- DELETE may send a JSON body when `body` is declared.
- GET → query hook; POST / PUT / PATCH / DELETE → mutation hook. GET routes with `infinite` also expose `.infinite`.

## License

MIT
