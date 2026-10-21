---
title: Update the cache from a mutation
description: Write a successful edit into the post query cache and refresh the list.
---

# Update the cache from a mutation

After this page an edit updates the open post immediately, and the list refetches so titles stay in sync.

Add the route to the contract. The cache stores the query result, `{ status, body }`, so the mutation result can be written as-is.

::: code-group

```ts [src/api/posts.contract.ts]
update: {
  method: HTTP_METHOD.PATCH,
  path: "/posts/:id",
  pathParams: z.object({ id: z.string() }),
  body: z.object({ title: z.string(), body: z.string() }),
  responses: {
    200: PostSchema,
    404: z.object({ message: z.string() }),
  },
},
```

:::

::: code-group

```tsx [src/posts/EditPostForm.tsx]
import { useQueryClient } from "@tanstack/react-query"
import type { FormEvent } from "react"
import { buildQueryKey } from "typed-api-contract/react-query"
import { postsHooks } from "../api/posts"

interface EditPostFormProps {
  postId: string
  title: string
  body: string
}

export function EditPostForm({ postId, title, body }: EditPostFormProps) {
  const queryClient = useQueryClient()
  const updatePost = postsHooks.posts.update({
    onSuccess: (result, variables) => {
      if (result.status !== 200) {
        return
      }

      queryClient.setQueryData(
        buildQueryKey(["posts", "getById"], { params: variables.params }),
        result,
      )
      void queryClient.invalidateQueries({ queryKey: ["posts", "list"] })
    },
  })

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    updatePost.mutate({
      params: { id: postId },
      body: {
        title: String(form.get("title")),
        body: String(form.get("body")),
      },
    })
  }

  return (
    <form onSubmit={onSubmit}>
      <input name="title" required defaultValue={title} />
      <textarea name="body" required defaultValue={body} />
      <button type="submit" disabled={updatePost.isPending}>
        Save
      </button>
      {updatePost.data?.status === 404 && (
        <p role="alert">{updatePost.data.body.message}</p>
      )}
    </form>
  )
}
```

:::

`buildQueryKey(["posts", "getById"], { params })` is the key `postsHooks.posts.getById` reads. Writing `result.body` would not match that cache: the hook reads `query.data.status` and `query.data.body`.

A 404 is a successful mutation with a declared status, so `onSuccess` runs and the `status` check skips the cache write. The list is invalidated only after a 200, because a missing post did not change any title.

Next: [Server rendering](./server-rendering).
