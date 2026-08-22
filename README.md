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
| `typed-api-contract/react-query` | `useQuery` / `useMutation` tree from the same contract |

## Usage

```ts
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { initClient } from "typed-api-contract/client"
import { initQueryHooks } from "typed-api-contract/react-query"
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
```

Mount a TanStack `QueryClientProvider` in the app. This package does not provide one.

Next.js App Router: `typed-api-contract/react-query` ships with `"use client"` so hooks can be imported from Client Components. Interceptors and the rest of `typed-api-contract/client` are plain TypeScript and work in Node 18+ and the browser.

## Client options

`initClient(contract, { baseUrl })` still works. Optional fields:

```ts
import { initClient, type ClientInterceptor } from "typed-api-contract/client"

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
  validateRequest: false,
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
| `interceptors`     | `onRequest` / `onResponse` / `onError` hooks (see below) |

Every route caller also accepts optional `headers` and `signal`. They are not part of the contract and are ignored by query keys.

```ts
await postsClient.list({
  headers: { "X-Request-Id": requestId },
  signal: controller.signal,
})
```

Header merge order (later wins): JSON `Content-Type` when a body is sent → client `headers` → per-call `headers` → `onRequest` mutations.

Query hooks forward TanStack Query’s abort signal, so unmounting a query cancels the in-flight `fetch`.

## Interceptors

Each call runs:

```
build request → onRequest → fetch → JSON body → onResponse → Zod / status check
```

`onResponse` sees the wire result, including undeclared statuses, **before** `UnexpectedStatusError`. Zod still owns validation after the interceptor chain.

If `fetch`, JSON parse, or status/Zod validation fails, `onError` runs in array order:

- `throw` (or rethrow) stops the chain.
- `return` a `ClientResponse` to recover. That response is Zod-parsed once and does **not** go through `onError` again.

```ts
const recoverOnNetworkError: ClientInterceptor = {
  async onError(_request, error) {
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
- GET → query hook; POST / PUT / PATCH / DELETE → mutation hook.

## License

MIT
