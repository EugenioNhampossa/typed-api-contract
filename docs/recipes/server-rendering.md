---
title: Server rendering
description: Fetch a post on the server and pass it to the query hook as initial data.
---

# Server rendering

After this page the first render of a post comes from the server, and the query hook takes over in the browser.

`typed-api-contract/react-query` starts with `"use client"`, so a Server Component cannot call `initQueryOptions` or `prefetchQuery`. The client entry does not. Fetch with `postsClient` on the server and pass the result to the hook as `initialData`.

Keep that client in a module that does not import `typed-api-contract/react-query`. Re-export it from the API module in [React Query](../react-query), so components keep importing `postsClient` from `src/api/posts.ts`. Only the Server Component imports `posts.server.ts`.

::: code-group

```ts [src/api/posts.server.ts]
import { initClient } from "typed-api-contract/client"
import { postsContract } from "./posts.contract"

export const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
})

export type PostByIdResult = Awaited<
  ReturnType<typeof postsClient.posts.getById>
>
```

:::

The page is a Server Component. It awaits the post and renders the client component.

::: code-group

```tsx [src/app/posts/[id]/page.tsx]
import { postsClient } from "../../../../api/posts.server"
import { PostTitle } from "../../../../posts/PostTitle"

interface PostPageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params
  const initialPost = await postsClient.posts.getById({ params: { id } })

  return <PostTitle postId={id} initialPost={initialPost} />
}
```

:::

`initialData` is written into the cache under the same key as the hook call. `staleTime` keeps that value fresh, so the browser does not refetch the post on mount. The pending and error branches handle later refetches. With `initialData`, the first render is neither pending nor an error.

::: code-group

```tsx [src/posts/PostTitle.tsx]
"use client"

import type { PostByIdResult } from "../api/posts.server"
import { postsHooks } from "../api/posts"

interface PostTitleProps {
  postId: string
  initialPost: PostByIdResult
}

export function PostTitle({ postId, initialPost }: PostTitleProps) {
  const query = postsHooks.posts.getById(
    { params: { id: postId } },
    { initialData: initialPost, staleTime: 60_000 },
  )

  if (query.isPending) {
    return <p>Loading</p>
  }

  if (query.isError) {
    return <p role="alert">{query.error.message}</p>
  }

  if (query.data.status === 404) {
    return <p>{query.data.body.message}</p>
  }

  return <h1>{query.data.body.title}</h1>
}
```

:::

`import type` keeps `posts.server.ts` out of the client bundle. The hook still refetches when the data is older than `staleTime`, and after [an edit writes the cache](./update-from-mutation).

A status missing from `responses` throws on the server, from `postsClient`, before `PostTitle` renders. A declared 404 is data and renders the message.

Prefetching in the browser, such as on hover, stays on [`postsOptions`](../react-query#prefetch).
