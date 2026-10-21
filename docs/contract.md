---
title: Contract
description: Nest routes and declare path params, query, body, and a Zod schema per status.
---

# Contract

After this page you can describe a nested router whose path placeholders, query, body, and responses are all typed.

`initContract().router(...)` checks that the value is an `AppRouter` and keeps the literal keys. A value is either a route or another router, so groups can nest. To split that tree into one file per controller, see [Structure](./structure).

```ts
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { z } from "zod"

const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
})

export const postsContract = initContract().router({
  posts: {
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
    create: {
      method: HTTP_METHOD.POST,
      path: "/posts",
      body: z.object({ title: z.string(), body: z.string() }),
      responses: {
        201: PostSchema,
        400: z.object({ message: z.string() }),
      },
    },
  },
})
```

## Route fields

| Field | Required | Role |
| --- | --- | --- |
| `method` | yes | One of `HTTP_METHOD`: `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |
| `path` | yes | Starts with `/`. Placeholders are `:param` |
| `pathParams` | when the path has placeholders | Zod object. Keys must match the placeholders |
| `query` | no | Zod schema for the query string. Omit when there is no query |
| `body` | no | Zod schema for the request body. Omit when there is no body |
| `contentType` | no | `"json"` (default) or `"multipart"`. See [Multipart](./multipart) |
| `infinite` | no | Cursor config for a GET route. See [Cursor pagination](./pagination) |
| `responses` | yes | Map of HTTP status to a Zod schema |

Call arguments use `params`, `query`, and `body`. A missing schema is not an optional field: passing that key is a type error.

```ts
await postsClient.posts.list({ query: { page: 2 } })

await postsClient.posts.create({
  body: { title: "New", body: "Post" },
})
```

`list` has a `query` schema, so `query` is required even when every field on it is optional. Pass `query: {}` to omit `page`.

## Path params must match the path

`initClient` compares every `:param` in `path` with the keys of `pathParams`.

- A placeholder with no schema key throws.
- A schema key with no placeholder throws.
- `pathParams` must be a Zod object. A bare `z.string()` throws.
- A path with placeholders and no `pathParams` throws.

```ts
path: "/posts/:id"
pathParams: z.object({ id: z.string() })
```

The thrown `Error` names the method, the path, and the keys that disagree. The check runs when the client is created, not on each call.

Next: [Structure](./structure).
