---
title: React Query
description: Turn a contract into useQuery and useMutation hooks, plus options for prefetch.
---

# React Query

After this page you can mount the hooks, pass TanStack options, prefetch with the same query key, and invalidate a list after a create.

## Setup

Create the client and the hooks once, in the module that owns the API. Components import the hooks from there, never from `typed-api-contract` directly.

::: code-group

```ts [src/api/posts.ts]
import { initClient } from "typed-api-contract/client"
import { initQueryHooks } from "typed-api-contract/react-query"
import { postsContract } from "./posts.contract"

export const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
})

export const postsHooks = initQueryHooks(postsContract, postsClient)
```

:::

`postsContract` is the router from [Contract](./contract).

The app supplies `QueryClientProvider`. This package does not. Create the `QueryClient` inside a component so each server request in SSR gets its own cache. To seed a hook with data fetched on the server, see [Server rendering](./recipes/server-rendering).

::: code-group

```tsx [src/app/QueryProvider.tsx]
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
```

:::

Wrap the app root in `QueryProvider`. In Next.js App Router, add `"use client"` to `QueryProvider.tsx` and to every component that calls the hooks. The `typed-api-contract/react-query` module already contains `"use client"`.

## Queries

GET routes become `useQuery`. A query hook takes the call args, then optional TanStack options.

::: code-group

```tsx [src/posts/PostTitle.tsx]
import { postsHooks } from "../api/posts"

interface PostTitleProps {
  postId: string
}

export function PostTitle({ postId }: PostTitleProps) {
  const query = postsHooks.posts.getById({ params: { id: postId } })

  if (query.isPending) {
    return <p>Loading</p>
  }

  if (query.isError) {
    return <p role="alert">Could not load the post. {query.error.message}</p>
  }

  if (query.data.status === 404) {
    return <p>{query.data.body.message}</p>
  }

  return <h1>{query.data.body.title}</h1>
}
```

:::

After `isPending` and `isError` are handled, `data` is the union of the declared statuses. A 404 is data, not an error. `error` is a [`ContractClientError`](./responses): a status missing from `responses`, a Zod failure, or a network failure.

The second argument is any `useQuery` option except `queryKey` and `queryFn`. Those come from the contract. A common case is waiting for an id that is not known yet:

```tsx
const query = postsHooks.posts.getById(
  { params: { id: postId ?? "" } },
  { enabled: postId !== undefined, staleTime: 60_000 },
)
```

## Mutations

POST, PUT, PATCH, and DELETE become `useMutation`. A mutation hook takes TanStack options only. The call args go to `mutate`.

::: code-group

```tsx [src/posts/CreatePostForm.tsx]
import { useQueryClient } from "@tanstack/react-query"
import type { FormEvent } from "react"
import { postsHooks } from "../api/posts"

export function CreatePostForm() {
  const queryClient = useQueryClient()
  const createPost = postsHooks.posts.create({
    onSuccess: (result) => {
      if (result.status !== 201) {
        return
      }

      void queryClient.invalidateQueries({ queryKey: ["posts", "list"] })
    },
  })

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    createPost.mutate({
      body: {
        title: String(form.get("title")),
        body: String(form.get("body")),
      },
    })
  }

  const rejectionMessage =
    createPost.data?.status === 400 ? createPost.data.body.message : null

  return (
    <form onSubmit={onSubmit}>
      <input name="title" required />
      <textarea name="body" required />
      <button type="submit" disabled={createPost.isPending}>
        Create post
      </button>
      {rejectionMessage && <p role="alert">{rejectionMessage}</p>}
      {createPost.isError && <p role="alert">{createPost.error.message}</p>}
    </form>
  )
}
```

:::

::: warning
A declared 400 resolves the mutation. It reaches `onSuccess` and `data`, not `onError`. Check `status` before you invalidate or redirect.
:::

`["posts", "list"]` is a prefix of every `posts.list` key, so one call invalidates every page and filter of the list. See [Query keys](#query-keys). To show the new post before the server answers, see [Optimistic updates](./recipes/optimistic-updates). To write an edit straight into the post cache, see [Update the cache from a mutation](./recipes/update-from-mutation).

## Prefetch

`initQueryOptions` returns the same keys and query functions as the hooks, without calling them. Export it from the same API module, next to the hooks:

::: code-group

```ts [src/api/posts.ts]
import { initClient } from "typed-api-contract/client"
import { initQueryHooks, initQueryOptions } from "typed-api-contract/react-query"
import { postsContract } from "./posts.contract"

export const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
})

export const postsHooks = initQueryHooks(postsContract, postsClient)
export const postsOptions = initQueryOptions(postsContract, postsClient)
```

:::

Prefetch a post when the user points at its link. When `PostTitle` mounts for that id, it renders the cached post immediately, because the hook builds the same key.

::: code-group

```tsx [src/posts/PostLink.tsx]
import { useQueryClient } from "@tanstack/react-query"
import { postsOptions } from "../api/posts"

interface PostLinkProps {
  postId: string
  title: string
}

export function PostLink({ postId, title }: PostLinkProps) {
  const queryClient = useQueryClient()

  function prefetchPost() {
    void queryClient.prefetchQuery(
      postsOptions.posts.getById({ params: { id: postId } }),
    )
  }

  return (
    <a
      href={`/posts/${postId}`}
      onMouseEnter={prefetchPost}
      onFocus={prefetchPost}
    >
      {title}
    </a>
  )
}
```

:::

The options also work anywhere TanStack accepts `queryOptions`, such as `useQuery`, `ensureQueryData` in a router loader, and hydration.

## Query keys

`buildQueryKey` builds the key yourself. It is the route path segments, then `params`, then `query`. A missing `params` or `query` is `null`, so keys stay aligned.

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
