<p align="center">
  <img src="docs/public/logo.png" alt="typed-api-contract" width="120" />
</p>

# typed-api-contract

Typed REST contracts, a `fetch` client, and TanStack Query hooks inferred from Zod route definitions.

Full guide, in : <https://eugenionhampossa.github.io/typed-api-contract/>

## Install

```bash
npm i typed-api-contract zod
# optional, only if you use the React Query entry:
npm i react @tanstack/react-query
```

Peer dependencies: `zod` `^4`. `react` (`^18` or `^19`) and `@tanstack/react-query` `^5` are optional. They are required only for `typed-api-contract/react-query`.

## Entries

| Import | Purpose |
| --- | --- |
| `typed-api-contract` | Define routes with `initContract` |
| `typed-api-contract/client` | Typed `fetch` client from a contract |
| `typed-api-contract/react-query` | `useQuery` / `useMutation` / options from the contract |

## Quickstart

```ts
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { initClient } from "typed-api-contract/client"
import { z } from "zod"

const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
})

const postsContract = initContract().router({
  posts: {
    getById: {
      method: HTTP_METHOD.GET,
      path: "/posts/:id",
      pathParams: z.object({ id: z.string() }),
      responses: {
        200: PostSchema,
        404: z.object({ message: z.string() }),
      },
    },
  },
})

const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
})

const post = await postsClient.posts.getById({ params: { id: "1" } })

if (post.status === 200) {
  post.body.title
}
```

A declared status, including 404, is data. A status missing from `responses` throws `UnexpectedStatusError`.

Mount a TanStack `QueryClientProvider` in the app before using `initQueryHooks`. This package does not provide one. `typed-api-contract/react-query` ships with `"use client"`.

Client options, interceptors, auth refresh, multipart uploads, and cursor pagination are in the [guide](https://eugenionhampossa.github.io/typed-api-contract/).

## License

MIT
