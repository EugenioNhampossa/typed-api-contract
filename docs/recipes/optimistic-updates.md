---
title: Optimistic updates
description: Insert a created post into the cached lists, roll it back on failure, and refetch when the request settles.
---

# Optimistic updates

After this page the list shows a new post before the server answers, drops it when the request fails, and replaces it with the server's post when the request settles.

The generated mutation hook types its context as `unknown`, so `onMutate` and `onError` cannot share a typed rollback value. Call `useMutation` with the `mutationFn` from [`postsOptions`](../react-query#prefetch) instead. The variables, the result, and the errors stay typed by the contract.

::: code-group

```tsx [src/posts/CreatePostForm.tsx]
import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query"
import type { FormEvent } from "react"
import { postsClient, postsOptions } from "../api/posts"

type PostList = Awaited<ReturnType<typeof postsClient.posts.list>>

interface Rollback {
  previous: [QueryKey, PostList | undefined][]
}

export function CreatePostForm() {
  const queryClient = useQueryClient()
  const createPost = useMutation({
    mutationFn: postsOptions.posts.create().mutationFn,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["posts", "list"] })

      const previous = queryClient.getQueriesData<PostList>({
        queryKey: ["posts", "list"],
      })

      queryClient.setQueriesData<PostList>(
        { queryKey: ["posts", "list"] },
        (current) => {
          if (current?.status !== 200) {
            return current
          }

          return {
            status: 200,
            body: [
              ...current.body,
              {
                id: crypto.randomUUID(),
                title: input.body.title,
                body: input.body.body,
              },
            ],
          }
        },
      )

      return { previous }
    },
    onError: (_error, _input, context: Rollback | undefined) => {
      if (!context) {
        return
      }

      for (const [queryKey, data] of context.previous) {
        queryClient.setQueryData(queryKey, data)
      }
    },
    onSettled: () => {
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

  return (
    <form onSubmit={onSubmit}>
      <input name="title" required />
      <textarea name="body" required />
      <button type="submit" disabled={createPost.isPending}>
        Create post
      </button>
    </form>
  )
}
```

:::

`["posts", "list"]` matches every cached page and filter of the list. A list that has not been fetched yet is not in the cache, so nothing is inserted there. Each cached value is `{ status, body }`, the same value the query hook reads. The inserted post uses a temporary id.

`onError` runs when the request throws, and it writes the previous lists back. A declared 400 does not throw, so it does not roll back. `onSettled` runs either way and refetches the lists, which drops the temporary post and shows the one the server saved.

`postsClient` and `postsOptions` come from the API module in [React Query](../react-query). `posts.list` returns `{ status: 200, body: Post[] }`, from the contract in [Quickstart](../quickstart).

Next: [Update the cache from a mutation](./update-from-mutation).
