---
title: Auth refresh
description: Refresh a bearer token once on 401, including when several calls fail together.
---

# Auth refresh

After this page a 401 refreshes credentials once and retries the request. Concurrent 401 responses share that refresh.

```ts
import {
  createAuthRefreshInterceptor,
  initClient,
} from "typed-api-contract/client"

let accessToken = ""

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

`postsContract` is any contract from [Contract](./contract). `refreshAccessToken` is your token call.

## What it does

| Option | Default | Role |
| --- | --- | --- |
| `refresh` | required | Loads new credentials. Concurrent 401s await the same promise |
| `getAccessToken` | none | When set, `onRequest` writes `Authorization: Bearer <token>`, including on the retry |
| `isUnauthorized` | `status === 401` | Decides which responses refresh |

The interceptor throws `AuthUnauthorizedError` from `onResponse` when `isUnauthorized` is true. `onError` catches that error, calls `refresh`, and `retry()`s. The retry runs `onRequest` again, so `getAccessToken` can return the new token.

::: warning
The retry happens once. A second unauthorized response is not retried. The caller sees `AuthUnauthorizedError`, whose `response` is the unauthorized `ClientResponse`. While this interceptor is installed, that status is not returned as `{ status, body }`, even if the route declares it.
:::

```ts
import { AuthUnauthorizedError } from "typed-api-contract/client"

try {
  await postsClient.posts.getById({ params: { id: "1" } })
} catch (error) {
  if (error instanceof AuthUnauthorizedError) {
    error.response.status
  }
}
```

Put this interceptor in the `interceptors` array where a 401 should refresh before later `onError` hooks. Hooks run in array order. See [Interceptors](./interceptors).

Next: [Multipart](./multipart).
