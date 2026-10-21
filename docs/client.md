---
title: Client
description: Configure initClient, per-call headers and abort, request validation, and query serializers.
---

# Client

After this page you can set the shared client options, override headers and abort per call, and choose how arrays are written into the query string.

```ts
import {
  initClient,
  serializeQueryRepeat,
  type ClientInterceptor,
} from "typed-api-contract/client"

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

`postsContract` is the router from [Contract](./contract). `customFetch` has the same signature as `fetch`. `authInterceptor` is a `ClientInterceptor`. See [Interceptors](./interceptors).

## Options

| Option | Default | Role |
| --- | --- | --- |
| `baseUrl` | required | API origin, no trailing slash. Example: `https://api.example.com` |
| `headers` | none | `HeadersInit`, or a sync or async function called on every request |
| `fetch` | `globalThis.fetch` | Custom implementation. Read when the call runs, not when the client is created |
| `credentials` | none | Forwarded as `RequestInit.credentials` |
| `signal` | none | Aborts every request. Combined with a per-call `signal` when both are set |
| `validateRequest` | `false` | Zod-parse `params`, `query`, and `body` before `fetch` |
| `querySerializer` | `serializeQuery` | Turns `query` into a string that starts with `?` |
| `interceptors` | `[]` | `onRequest`, `onResponse`, and `onError` around each call |

## Per-call headers and abort

Every route function also accepts `headers` and `signal`. They are not part of the contract. Query keys ignore them.

```ts
await postsClient.posts.getById({
  params: { id: "1" },
  headers: { "X-Request-Id": requestId },
  signal: controller.signal,
})
```

Header merge order, later wins:

1. `Content-Type: application/json`, only when a JSON body is sent
2. Client `headers` (the object or the thunk)
3. Per-call `headers`
4. Mutations made in `onRequest`

A multipart body never sets `Content-Type`. The runtime adds the boundary. See [Multipart](./multipart).

Path values are passed through `encodeURIComponent`. `id: "a/b"` becomes `/posts/a%2Fb`.

## Request validation

::: warning
`validateRequest` defaults to `false`. Request `params`, `query`, and `body` are still typed. They are checked with Zod only when you opt in. Response bodies are always parsed, whether or not this flag is set.
:::

A failed request parse throws `ZodError` before `fetch`.

## Query serializers

The default serializer stringifies each value, so an array becomes one comma-joined field. Undefined values are skipped.

```ts
import {
  serializeQuery,
  serializeQueryBrackets,
  serializeQueryRepeat,
} from "typed-api-contract/client"

serializeQuery({ tags: ["a", "b"] })
// "?tags=a%2Cb"

serializeQueryRepeat({ tags: ["a", "b"], page: 1 })
// "?tags=a&tags=b&page=1"

serializeQueryBrackets({ tags: ["a", "b"], page: 1 })
// "?tags%5B%5D=a&tags%5B%5D=b&page=1"
```

`URLSearchParams` percent-encodes the brackets in the third form. Pass the function as `querySerializer`. It is not selected per route.

Next: [Responses and errors](./responses).
