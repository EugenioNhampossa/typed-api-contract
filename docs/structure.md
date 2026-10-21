---
title: Structure
description: One client per origin, one file per controller, and a path prefix for each service behind a gateway.
---

# Structure

After this page you can split routes into one file per controller, share a client across services on the same gateway, and add a client when the origin changes.

One origin gets one client. The contract tree is how components call that origin. The path prefix and the object keys are chosen separately.

## One client per origin

`baseUrl`, headers, credentials, and interceptors belong to one `initClient`, and every route in the tree uses them. Controllers on the same host belong in that tree. A host or an auth scheme of its own gets another `initClient`. The app still has one `QueryClientProvider`. The option list is on [Client](./client).

## One file per controller

`router()` returns its tree unchanged, so each controller is a router in its own file and the root nests them. One level per controller. Add a deeper level when the API is a real hierarchy, such as `admin.orgs.teams`.

::: code-group

```ts [src/api/posts.contract.ts]
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { z } from "zod"
import { PostSchema } from "./schemas"

export const postsContract = initContract().router({
  list: {
    method: HTTP_METHOD.GET,
    path: "/posts",
    query: z.object({ page: z.coerce.number().optional() }),
    responses: { 200: z.array(PostSchema) },
  },
  getById: {
    method: HTTP_METHOD.GET,
    path: "/posts/:id",
    pathParams: z.object({ id: z.string() }),
    responses: {
      200: PostSchema,
      404: z.object({ message: z.string() }),
    },
  },
})
```

```ts [src/api/billing.contract.ts]
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { z } from "zod"
import { InvoiceSchema } from "./schemas"

const BILLING = "/billing"

export const billingContract = initContract().router({
  invoices: {
    list: {
      method: HTTP_METHOD.GET,
      path: `${BILLING}/invoices`,
      responses: { 200: z.array(InvoiceSchema) },
    },
    getById: {
      method: HTTP_METHOD.GET,
      path: `${BILLING}/invoices/:id`,
      pathParams: z.object({ id: z.string() }),
      responses: { 200: InvoiceSchema },
    },
  },
})
```

```ts [src/api/contract.ts]
import { initContract } from "typed-api-contract"
import { billingContract } from "./billing.contract"
import { postsContract } from "./posts.contract"

export const apiContract = initContract().router({
  posts: postsContract,
  billing: billingContract,
})
```

:::

Components call `apiHooks.posts.getById` and `apiHooks.billing.invoices.getById`. The object keys are the query key, so invalidating `["billing"]` leaves every `posts` query cached. Name the keys for the way you invalidate.

## Gateway prefix

The group name is not written into the URL. A call fetches `baseUrl` plus that route's `path`. Services behind one gateway differ by a prefix, so keep the prefix in a constant next to the contract and use it on every path in the file. `BILLING` above is that constant.

```ts
await apiClient.billing.invoices.getById({ params: { id: "1" } })
// GET https://gateway.example.com/billing/invoices/1
```

The query key for that call is `["billing", "invoices", "getById", { id: "1" }, null]`. It comes from the object keys, then `params`, then `query`.

A route nested under `billing` whose `path` is `/invoices` is sent to `/invoices`. The parent key does not fill in the missing prefix.

## The module components import

Create the client, the hooks, and the options once, in the module for that origin. Components import them from there.

::: code-group

```ts [src/api/api.ts]
import { initClient } from "typed-api-contract/client"
import { initQueryHooks, initQueryOptions } from "typed-api-contract/react-query"
import { apiContract } from "./contract"

export const apiClient = initClient(apiContract, {
  baseUrl: "https://gateway.example.com",
})

export const apiHooks = initQueryHooks(apiContract, apiClient)
export const apiOptions = initQueryOptions(apiContract, apiClient)
```

:::

Pass the same contract to `initClient`, `initQueryHooks`, and `initQueryOptions`. The keys stay aligned: `billing.invoices.getById` on the contract is `apiClient.billing.invoices.getById` and `apiHooks.billing.invoices.getById`.

`typed-api-contract/react-query` starts with `"use client"`. A Server Component imports a module that only calls `initClient`, and `api.ts` re-exports that client for the browser. See [React Query](./react-query) and [Server rendering](./recipes/server-rendering).

## A second origin

A service on another host, or one that needs its own auth interceptor, is a second config. Nesting cannot give `billing` its own `baseUrl`.

::: code-group

```ts [src/api/billing/api.ts]
import { initClient } from "typed-api-contract/client"
import { initQueryHooks } from "typed-api-contract/react-query"
import { billingContract } from "./contract"

export const billingClient = initClient(billingContract, {
  baseUrl: "https://billing.example.com",
  interceptors: [billingAuth],
})

export const billingHooks = initQueryHooks(billingContract, billingClient)
```

:::

Both clients render under the same `QueryClientProvider`. Two trees that share a `QueryClient` need different root keys. The cache key is the object path, not the URL, so two contracts that both start at `list` share `["list", ...]`.

## Shared schemas

A Zod object used by more than one controller lives in a schema file, and the route files import it. Share a contract across origins only when both origins expose those same routes.

Next: [Client](./client).
