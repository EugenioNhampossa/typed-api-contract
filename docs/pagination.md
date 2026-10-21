---
title: Cursor pagination
description: Add infinite config to a GET route and read pages from the hook or from query options.
---

# Cursor pagination

After this page a GET list exposes `.infinite` on its hook and on its query options. Each page param is a plain object merged into `query`.

Set `infinite` on the route. `initialPageParam` is sent as `query` for the first page. `getNextPageParam` receives the parsed page (`{ status, body }`) and returns the next query object, or `undefined` when the list ends.

```ts
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { initClient } from "typed-api-contract/client"
import { initQueryHooks, initQueryOptions } from "typed-api-contract/react-query"
import { z } from "zod"

const pageSchema = z.object({
  items: z.array(z.object({ id: z.string(), title: z.string() })),
  nextCursor: z.string().nullable(),
})

const postsContract = initContract().router({
  posts: {
    list: {
      method: HTTP_METHOD.GET,
      path: "/posts",
      query: z.object({ cursor: z.string().optional() }),
      responses: { 200: pageSchema },
      infinite: {
        initialPageParam: {} as { cursor?: string },
        getNextPageParam: (lastPage) => {
          const page = lastPage as {
            status: number
            body: { nextCursor: string | null }
          }

          if (page.status !== 200 || page.body.nextCursor === null) {
            return undefined
          }

          return { cursor: page.body.nextCursor }
        },
      },
    },
  },
})

const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
})

const hooks = initQueryHooks(postsContract, postsClient)
const options = initQueryOptions(postsContract, postsClient)
```

`getNextPageParam` is typed loosely (`lastPage` is `unknown`) so the route definition stays a plain object. Narrow `status` before reading `body`, the same way a normal call does.

## Hook

`.infinite` is `useInfiniteQuery`. Args are the first page's contract args. Further pages replace `query` with the object you return.

```tsx
function PostList() {
  const query = hooks.posts.list.infinite({ query: {} })

  const titles =
    query.data?.pages.flatMap((page) =>
      page.status === 200 ? page.body.items.map((item) => item.title) : [],
    ) ?? []

  return (
    <div>
      <ul>
        {titles.map((title) => (
          <li key={title}>{title}</li>
        ))}
      </ul>
      <button
        type="button"
        disabled={!query.hasNextPage}
        onClick={() => {
          void query.fetchNextPage()
        }}
      >
        More
      </button>
    </div>
  )
}
```

## Options

The options tree has the same `.infinite` function, for `useInfiniteQuery` outside the generated hook.

```tsx
import { useInfiniteQuery } from "@tanstack/react-query"

useInfiniteQuery(options.posts.list.infinite({ query: {} }))
```

Only GET routes accept `infinite`. Other methods stay mutations and do not grow an `.infinite` property.

Next: [Interceptors](./interceptors).
