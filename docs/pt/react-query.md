---
title: React Query
description: Transforme um contrato em hooks useQuery e useMutation, e em opções para prefetch.
---

# React Query

Depois desta página consegue montar os hooks, passar opções do TanStack, fazer prefetch com a mesma chave e invalidar uma lista depois de uma criação.

Importe `initQueryHooks` e `initQueryOptions` de `typed-api-contract/react-query`. A aplicação fornece o `QueryClientProvider`. Este pacote não o fornece.

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { initClient } from "typed-api-contract/client"
import { initQueryHooks, initQueryOptions } from "typed-api-contract/react-query"

const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
})

const hooks = initQueryHooks(postsContract, postsClient)
const options = initQueryOptions(postsContract, postsClient)

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PostTitle />
    </QueryClientProvider>
  )
}
```

`postsContract` é o router de [Contrato](./contract). No Next.js App Router, importe esta entrada a partir de um Client Component. O módulo já contém `"use client"`.

## Queries e mutations

As rotas GET passam a `useQuery`. POST, PUT, PATCH e DELETE passam a `useMutation`.

::: tip
Um hook de query recebe os argumentos da chamada e depois opções opcionais do TanStack. Um hook de mutation recebe só as opções do TanStack. Os argumentos da chamada vão para `mutate`.
:::

```tsx
import { useQueryClient } from "@tanstack/react-query"

function PostTitle() {
  const query = hooks.posts.getById({ params: { id: "1" } })

  if (query.data?.status === 200) {
    return <p>{query.data.body.title}</p>
  }

  if (query.data?.status === 404) {
    return <p>{query.data.body.message}</p>
  }

  if (query.error) {
    return <p>{query.error.name}</p>
  }

  return <p>A carregar</p>
}

function CreatePostButton() {
  const queryClient = useQueryClient()
  const create = hooks.posts.create({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })

  return (
    <button
      type="button"
      onClick={() =>
        create.mutate({ body: { title: "New", body: "Post" } })
      }
    >
      Criar
    </button>
  )
}
```

O segundo argumento de um hook de query é qualquer opção de `useQuery` excepto `queryKey` e `queryFn`. Essas vêm do contrato.

```tsx
hooks.posts.getById({ params: { id: "1" } }, { enabled: false })
```

`error` é um [`ContractClientError`](./responses). Os estados declarados chegam em `data`, não em `error`.

## Opções, prefetch e chaves

`initQueryOptions` devolve as mesmas chaves e funções de query, sem chamar os hooks. Use-o com `useQuery`, `prefetchQuery` e hidratação.

```ts
import { useQuery } from "@tanstack/react-query"

useQuery(options.posts.list({ query: {} }))

await queryClient.prefetchQuery(
  options.posts.getById({ params: { id: "1" } }),
)
```

`buildQueryKey` constrói essa chave directamente. É os segmentos do caminho da rota, depois `params`, depois `query`. A ausência de `params` ou `query` fica `null`, para as chaves se manterem alinhadas.

```ts
import { buildQueryKey } from "typed-api-contract/react-query"

buildQueryKey(["posts", "list"], { query: { page: 2 } })
// ["posts", "list", null, { page: 2 }]

buildQueryKey(["posts", "getById"], { params: { id: "1" } })
// ["posts", "getById", { id: "1" }, null]
```

::: warning
`headers` e `signal` de cada chamada não fazem parte da chave. Duas chamadas que só diferem nos cabeçalhos partilham a mesma entrada de cache.
:::

A função de query encaminha o sinal de cancelamento do TanStack Query, combinado com um `signal` da chamada quando o passa. Desmontar uma query cancela o `fetch` em curso.

Seguinte: [Paginação por cursor](./pagination).
