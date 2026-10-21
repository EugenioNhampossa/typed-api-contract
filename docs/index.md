---
layout: home

hero:
  name: typed-api-contract
  text: Typed REST contracts
  tagline: Zod routes, a typed fetch client, and TanStack Query hooks.
  actions:
    - theme: brand
      text: Quickstart
      link: /quickstart
    - theme: alt
      text: Install
      link: /install

features:
  - title: Contract
    details: Describe each route once. Method, path, params, query, body, and a Zod schema per status.
  - title: Client
    details: initClient mirrors that tree. A call returns { status, body } for every declared status.
  - title: React Query
    details: GET becomes useQuery. POST, PUT, PATCH, and DELETE become useMutation.
---

After this page you know which entry to import, and which defaults the client already applies.

## Three entries

| Import | Use it to |
| --- | --- |
| `typed-api-contract` | Define routes with `initContract` |
| `typed-api-contract/client` | Call those routes with `fetch` |
| `typed-api-contract/react-query` | Read and write them through TanStack Query |

`react` and `@tanstack/react-query` are optional peers. Install them only when you import `typed-api-contract/react-query`.

## How a call is built

1. `initContract().router(...)` is the source of truth.
2. `initClient` walks that tree and returns one function per route.
3. `initQueryHooks` and `initQueryOptions` call those functions. GET routes are queries. Every other method is a mutation.

Pass the same contract to the client and to the hooks. The keys match: `posts.getById` on the contract is `postsClient.posts.getById` and `hooks.posts.getById`.

## Defaults

- Response bodies are typed from the status schema. They are parsed at runtime only when `validateResponse` is `true`. The default is `false`.
- `params`, `query`, and `body` are typed. They are parsed at runtime only when `validateRequest` is `true`. The default is `false`.
- A declared status, including 4xx and 5xx, is data shaped as `{ status, body }`.
- A status with no schema throws [`UnexpectedStatusError`](./responses).

Next: [Install](./install).
