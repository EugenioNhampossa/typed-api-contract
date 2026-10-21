---
title: React Query
description: Turn a contract into useQuery and useMutation hooks, plus options for prefetch.
---

# React Query

After this page you can mount the hooks, pass TanStack options, prefetch with the same query key, and invalidate a list after a create.

Import `initQueryHooks` and `initQueryOptions` from `typed-api-contract/react-query`. The app supplies `QueryClientProvider`. This package does not.

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { initClient } from "typed-api-contract/client"
import { initQueryHooks, initQueryOptions } from "typed-api-contract/react-query"

const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
})

const hooks = initQueryHooks(postsContract, postsClient)
const options = initQueryOptions(postsContract, postsClient)

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PostTitle />
    </QueryClientProvider>
  )
}
```

`postsContract` is the router from [Contract](./contract). In Next.js App Router, import this entry from a Client Component. The module already contains `"use client"`.

## Queries and mutations

GET routes become `useQuery`. POST, PUT, PATCH, and DELETE become `useMutation`.

::: tip
A query hook takes the call args, then optional TanStack options. A mutation hook takes TanStack options only. The call args go to `mutate`.
:::

```tsx
import { useQueryClient } from "@tanstack/react-query"

function PostTitle() {
  const query = hooks.posts.getById({ params: { id: "1" } })

  if (query.data?.status === 200) {
    return <p>{query.data.body.title}</p>
  }

  if (query.data?.status === 404) {
    return <p>{query.data.body.message}</p>
  }

  if (query.error) {
    return <p>{query.error.name}</p>
  }

  return <p>Loading</p>
}

function CreatePostButton() {
  const queryClient = useQueryClient()
  const create = hooks.posts.create({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })

  return (
    <button
      type="button"
      onClick={() =>
        create.mutate({ body: { title: "New", body: "Post" } })
      }
    >
      Create
    </button>
  )
}
```

The second argument of a query hook is any `useQuery` option except `queryKey` and `queryFn`. Those come from the contract.

```tsx
hooks.posts.getById({ params: { id: "1" } }, { enabled: false })
```

`error` is a [`ContractClientError`](./responses). Declared statuses still arrive on `data`, not on `error`.

## Options, prefetch, and keys

`initQueryOptions` returns the same keys and query functions, without calling the hooks. Use it with `useQuery`, `prefetchQuery`, and hydration.

```ts
import { useQuery } from "@tanstack/react-query"

useQuery(options.posts.list({ query: {} }))

await queryClient.prefetchQuery(
  options.posts.getById({ params: { id: "1" } }),
)
```

`buildQueryKey` builds that key yourself. It is the route path segments, then `params`, then `query`. A missing `params` or `query` is `null`, so keys stay aligned.

```ts
import { buildQueryKey } from "typed-api-contract/react-query"

buildQueryKey(["posts", "list"], { query: { page: 2 } })
// ["posts", "list", null, { page: 2 }]

buildQueryKey(["posts", "getById"], { params: { id: "1" } })
// ["posts", "getById", { id: "1" }, null]
```

::: warning
Per-call `headers` and `signal` are not part of the key. Two calls that differ only by headers share a cache entry.
:::

The query function forwards TanStack Query's abort signal, combined with a per-call `signal` when you pass one. Unmounting a query cancels the in-flight `fetch`.

Next: [Cursor pagination](./pagination).
