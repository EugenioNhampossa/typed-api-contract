---
title: Multipart
description: Send a route body as FormData from a plain object or a FormData instance.
---

# Multipart

After this page you can upload a file on a route whose body is `FormData`, without setting `Content-Type` yourself.

Set `contentType: "multipart"`. The body schema still describes the fields. Callers pass either that object or a ready `FormData`.

```ts
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { initClient } from "typed-api-contract/client"
import { z } from "zod"

const postsContract = initContract().router({
  posts: {
    upload: {
      method: HTTP_METHOD.POST,
      path: "/uploads",
      contentType: "multipart",
      body: z.object({
        title: z.string(),
        file: z.custom<File>(),
      }),
      responses: { 201: z.object({ id: z.string() }) },
    },
  },
})

const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
})

const created = await postsClient.posts.upload({
  body: { title: "Cover", file },
})

if (created.status === 201) {
  created.body.id
}
```

A plain object is copied into `FormData`:

- `undefined` is skipped
- Arrays append the same key once per item
- `File` keeps its name
- `Blob` is appended as `"blob"`
- Strings are appended as-is
- Anything else is `String(value)`

Passing `FormData` sends that instance unchanged.

::: warning
Multipart requests do not set `Content-Type`. The fetch implementation adds the multipart boundary. Setting the header yourself drops that boundary and the server cannot read the parts.
:::

JSON stays the default. Omit `contentType`, or set `"json"`, and a declared body is `JSON.stringify`'d with `Content-Type: application/json`.

After a successful upload, invalidate the list with the key from [React Query](./react-query):

```ts
import { buildQueryKey } from "typed-api-contract/react-query"

await queryClient.invalidateQueries({
  queryKey: buildQueryKey(["posts", "list"]),
})
```

The reference lists every export: [Contract](./reference/contract), [Client](./reference/client), [React Query](./reference/react-query).
