---
title: Responses and errors
description: Narrow declared statuses, and handle unexpected statuses, Zod failures, and empty bodies.
---

# Responses and errors

After this page you can tell a declared error status from a thrown error, and type an empty body.

A call resolves to a union of the statuses in `responses`. Each member is `{ status, body }`, and `body` is the output of that status schema.

```ts
const result = await postsClient.posts.getById({
  params: { id: "1" },
})

if (result.status === 200) {
  result.body.title
}

if (result.status === 404) {
  result.body.message
}
```

::: warning
A declared status is data, including 4xx and 5xx. `fetch` does not reject on those statuses, and this client does not turn them into exceptions. Only a status missing from `responses` is thrown.
:::

## Unexpected status

```ts
import { UnexpectedStatusError } from "typed-api-contract/client"

try {
  await postsClient.posts.getById({ params: { id: "1" } })
} catch (error) {
  if (error instanceof UnexpectedStatusError) {
    error.status
    error.method
    error.path
  }
}
```

`path` is the template from the contract, such as `/posts/:id`, not the URL with the id filled in. The message is `Unexpected status ${status} for ${method} ${path}`.

## Zod failures

Response bodies are parsed with the schema for the status that came back only when [`validateResponse`](./client) is `true`. A body that does not match throws `ZodError` from Zod. The default is `false`, so a mismatched body is returned as `{ status, body }` with the value that arrived.

Request `params`, `query`, and `body` throw `ZodError` only when [`validateRequest`](./client) is `true`.

## Errors on a query or mutation

TanStack Query puts failures on `error`. `ContractClientError` is the union those hooks use:

| Error | When |
| --- | --- |
| `UnexpectedStatusError` | The status has no schema on the route |
| `AuthUnauthorizedError` | The [auth refresh](./auth) retry is still unauthorized |
| `ZodError` | The response body failed its schema when `validateResponse` is set, or request args failed `validateRequest` |
| `Error` | Another failure, such as `fetch` rejecting |

Import `UnexpectedStatusError` and `AuthUnauthorizedError` from `typed-api-contract/client`. Import `ZodError` from `zod`. Import the `ContractClientError` type from `typed-api-contract/react-query`.

## Empty bodies

Use `z.void()` or `z.undefined()` for a status with no body, such as 204. The parsed `body` is `undefined`.

```ts
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { initClient } from "typed-api-contract/client"
import { z } from "zod"

const postsContract = initContract().router({
  posts: {
    remove: {
      method: HTTP_METHOD.DELETE,
      path: "/posts/:id",
      pathParams: z.object({ id: z.string() }),
      responses: { 204: z.void() },
    },
  },
})

const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
})

const removed = await postsClient.posts.remove({ params: { id: "1" } })

if (removed.status === 204) {
  removed.body
}
```

DELETE sends a JSON body when `body` is declared. GET does not send a body.

```ts
remove: {
  method: HTTP_METHOD.DELETE,
  path: "/posts/:id",
  pathParams: z.object({ id: z.string() }),
  body: z.object({ reason: z.string() }),
  responses: { 200: z.object({ deleted: z.boolean() }) },
}

await postsClient.posts.remove({
  params: { id: "1" },
  body: { reason: "duplicate" },
})
```

Next: [React Query](./react-query).
