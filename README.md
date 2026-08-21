# typed-api-contract

Typed REST contracts, a `fetch` client, and TanStack Query hooks inferred from Zod route definitions.

## Install

```bash
npm i typed-api-contract zod
# optional, only if you use the React Query entry:
npm i react @tanstack/react-query
```

Peer dependencies: `zod` `^4`. `react` and `@tanstack/react-query` `^5` are optional and required only for `typed-api-contract/react-query`.

## Entries


| Import                           | Purpose                                                |
| -------------------------------- | ------------------------------------------------------ |
| `typed-api-contract`             | Define routes with `initContract`                      |
| `typed-api-contract/client`      | Typed `fetch` client from a contract                   |
| `typed-api-contract/react-query` | `useQuery` / `useMutation` tree from the same contract |




## Usage

```ts
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { initClient } from "typed-api-contract/client"
import { initQueryHooks } from "typed-api-contract/react-query"
import { z } from "zod"

const postsContract = initContract().router({
  list: {
    method: HTTP_METHOD.GET,
    path: "/posts",
    responses: { 200: z.array(z.object({ id: z.string(), title: z.string() })) },
  },
})

const postsClient = initClient(postsContract, { baseUrl: "https://api.example.com" })
const postsHooks = initQueryHooks(postsContract, postsClient)
```

Mount a TanStack `QueryClientProvider` in the app. This package does not provide one.

Next.js App Router: `typed-api-contract/react-query` ships with `"use client"` so hooks can be imported from Client Components.

## v1 limitations

- `initClient` accepts `{ baseUrl }` only. No auth headers, custom `fetch`, or `AbortSignal`.
- Request `params` / `query` / `body` are typed, not parsed at runtime. Responses are Zod-parsed.
- Declared HTTP statuses (including 4xx) are data. Undeclared statuses throw `UnexpectedStatusError`.
- GET → query hook; POST / PUT / PATCH / DELETE → mutation hook.



## License

MIT