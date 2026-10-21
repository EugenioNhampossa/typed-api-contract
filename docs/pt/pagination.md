---
title: Paginação por cursor
description: Acrescente infinite a uma rota GET e leia as páginas no hook ou nas opções de query.
---

# Paginação por cursor

Depois desta página uma lista GET expõe `.infinite` no hook e nas opções de query. Cada parâmetro de página é um objecto simples fundido em `query`.

Defina `infinite` na rota. `initialPageParam` é enviado como `query` na primeira página. `getNextPageParam` recebe a página analisada (`{ status, body }`) e devolve o objecto da query seguinte, ou `undefined` quando a lista acaba.

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

`getNextPageParam` é tipado de forma larga (`lastPage` é `unknown`) para a definição da rota continuar um objecto simples. Faça a selecção de `status` antes de ler `body`, como numa chamada normal.

## Hook

`.infinite` é `useInfiniteQuery`. Os argumentos são os da primeira página. As páginas seguintes substituem `query` pelo objecto que devolver.

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
        Mais
      </button>
    </div>
  )
}
```

## Opções

A árvore de opções tem a mesma função `.infinite`, para `useInfiniteQuery` fora do hook gerado.

```tsx
import { useInfiniteQuery } from "@tanstack/react-query"

useInfiniteQuery(options.posts.list.infinite({ query: {} }))
```

Só as rotas GET aceitam `infinite`. Os outros métodos continuam mutations e não ganham uma propriedade `.infinite`.

Seguinte: [Interceptores](./interceptors).
