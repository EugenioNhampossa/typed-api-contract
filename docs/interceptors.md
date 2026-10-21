---
title: Interceptors
description: Run onRequest, onResponse, and onError around each call, including one retry.
---

# Interceptors

After this page you can change a request, inspect the wire response, recover from a failure, or retry a call once.

Pass `interceptors` to `initClient`. Each call runs them in array order:

```text
build request
onRequest
fetch
map body
onResponse
Zod parse and status check
```

`onResponse` runs before `UnexpectedStatusError` and before Zod. It sees undeclared statuses. Zod still validates whatever comes out of the chain.

```ts
import type { ClientInterceptor } from "typed-api-contract/client"

const trace: ClientInterceptor = {
  onRequest(request) {
    request.headers.set("X-Request-Id", requestId)
    return request
  },
  onResponse(_request, response) {
    return response
  },
  onError(_request, error) {
    throw error
  },
}
```

`onRequest` must return the `ClientRequest` (or a promise of one). `onResponse` must return the `ClientResponse`.

## When onError runs

`onError` runs if `fetch` rejects, JSON parsing fails, or status and Zod validation throw. Three outcomes:

- Throw (or rethrow) to stop the chain. Later interceptors do not see the error.
- Return a `ClientResponse` to recover. That response is Zod-parsed once and does not go through `onError` again.
- Call `ctx.retry(request?)` to run `onRequest`, `fetch`, and `onResponse` again.

::: warning
`retry()` runs once per call. A second `retry()` throws `Error`. The retry does not enter `onError` again.
:::

```ts
import type { ClientInterceptor, ClientResponse } from "typed-api-contract/client"

const recoverOnNetworkError: ClientInterceptor = {
  async onError(_request, error, _ctx) {
    if (!(error instanceof TypeError)) {
      throw error
    }

    const recovered: ClientResponse = {
      status: 200,
      body: fallbackBody,
      headers: new Headers(),
      raw: new Response(),
    }

    return recovered
  },
}

const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
  interceptors: [trace, recoverOnNetworkError],
})
```

`fallbackBody` must match the Zod schema of the status you return, because parsing still runs.

[Auth refresh](./auth) is this retry path with a shared refresh for concurrent 401 responses.

Next: [Auth refresh](./auth).
