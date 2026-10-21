---
title: Quickstart
description: Define a posts contract, call getById, and narrow the result on status.
---

# Quickstart

After this page you can define a route, call it, and read a 200 body or a 404 body from the same return value.

## 1. Define a route

A contract is a tree of routes. Each leaf has a method, a path, and a Zod schema for every status you want to handle.

```ts
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { z } from "zod"

const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
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
```

`posts` is a group. `getById` is the route. The client and the hooks will use those same keys.

## 2. Create the client

`baseUrl` is the API origin with no trailing slash. Paths on the contract start with `/`.

```ts
import { initClient } from "typed-api-contract/client"

const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
})
```

## 3. Call the route and narrow the status

The argument key is `params`, matching `pathParams` on the route. The result is a union of the declared statuses.

```ts
const result = await postsClient.posts.getById({
  params: { id: "1" },
})

if (result.status === 200) {
  result.body.title
}

if (result.status === 404) {
  result.body.message
}
```

::: warning
404 is not thrown. It is declared on the route, so it is data. A status that is not in `responses` throws `UnexpectedStatusError`. See [Responses and errors](./responses).
:::

## Full example

```ts
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { initClient } from "typed-api-contract/client"
import { z } from "zod"

const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
})

const postsContract = initContract().router({
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

const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
})

const post = await postsClient.posts.getById({ params: { id: "1" } })

if (post.status === 200) {
  post.body.title
}
```

## Next

| Page | What you add |
| --- | --- |
| [Contract](./contract) | Nesting, path params, query, body, and responses |
| [Client](./client) | Headers, abort, validation, and query serializers |
| [React Query](./react-query) | `useQuery`, `useMutation`, and prefetch |
