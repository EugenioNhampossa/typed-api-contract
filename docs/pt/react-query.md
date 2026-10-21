---
title: React Query
description: Transforme um contrato em hooks useQuery e useMutation, e em opções para prefetch.
---

# React Query

Depois desta página consegue montar os hooks, passar opções do TanStack, fazer prefetch com a mesma chave e invalidar uma lista depois de uma criação.

## Configuração

Crie o cliente e os hooks uma única vez, no módulo responsável pela API. Os componentes importam os hooks daí, nunca directamente de `typed-api-contract`.

::: code-group

```ts [src/api/posts.ts]
import { initClient } from "typed-api-contract/client"
import { initQueryHooks } from "typed-api-contract/react-query"
import { postsContract } from "./posts.contract"

export const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
})

export const postsHooks = initQueryHooks(postsContract, postsClient)
```

:::

`postsContract` é o router de [Contrato](./contract).

A aplicação fornece o `QueryClientProvider`. Este pacote não o fornece. Crie o `QueryClient` dentro de um componente, para que cada pedido no servidor em SSR tenha a sua própria cache. Para alimentar um hook com dados obtidos no servidor, veja [Renderização no servidor](./recipes/server-rendering).

::: code-group

```tsx [src/app/QueryProvider.tsx]
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
```

:::

Envolva a raiz da aplicação em `QueryProvider`. No Next.js App Router, adicione `"use client"` a `QueryProvider.tsx` e a todos os componentes que chamam os hooks. O módulo `typed-api-contract/react-query` já contém `"use client"`.

## Queries

As rotas GET passam a `useQuery`. Um hook de query recebe os argumentos da chamada e depois opções opcionais do TanStack.

::: code-group

```tsx [src/posts/PostTitle.tsx]
import { postsHooks } from "../api/posts"

interface PostTitleProps {
  postId: string
}

export function PostTitle({ postId }: PostTitleProps) {
  const query = postsHooks.posts.getById({ params: { id: postId } })

  if (query.isPending) {
    return <p>A carregar</p>
  }

  if (query.isError) {
    return <p role="alert">Não foi possível carregar o post. {query.error.message}</p>
  }

  if (query.data.status === 404) {
    return <p>{query.data.body.message}</p>
  }

  return <h1>{query.data.body.title}</h1>
}
```

:::

Depois de tratar `isPending` e `isError`, `data` é a união dos estados declarados. Um 404 é um dado, não um erro. `error` é um [`ContractClientError`](./responses): um estado ausente de `responses`, uma falha do Zod ou uma falha de rede.

O segundo argumento é qualquer opção de `useQuery` excepto `queryKey` e `queryFn`. Essas vêm do contrato. Um caso comum é esperar por um id que ainda não é conhecido:

```tsx
const query = postsHooks.posts.getById(
  { params: { id: postId ?? "" } },
  { enabled: postId !== undefined, staleTime: 60_000 },
)
```

## Mutations

POST, PUT, PATCH e DELETE passam a `useMutation`. Um hook de mutation recebe só as opções do TanStack. Os argumentos da chamada vão para `mutate`.

::: code-group

```tsx [src/posts/CreatePostForm.tsx]
import { useQueryClient } from "@tanstack/react-query"
import type { FormEvent } from "react"
import { postsHooks } from "../api/posts"

export function CreatePostForm() {
  const queryClient = useQueryClient()
  const createPost = postsHooks.posts.create({
    onSuccess: (result) => {
      if (result.status !== 201) {
        return
      }

      void queryClient.invalidateQueries({ queryKey: ["posts", "list"] })
    },
  })

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    createPost.mutate({
      body: {
        title: String(form.get("title")),
        body: String(form.get("body")),
      },
    })
  }

  const rejectionMessage =
    createPost.data?.status === 400 ? createPost.data.body.message : null

  return (
    <form onSubmit={onSubmit}>
      <input name="title" required />
      <textarea name="body" required />
      <button type="submit" disabled={createPost.isPending}>
        Criar post
      </button>
      {rejectionMessage && <p role="alert">{rejectionMessage}</p>}
      {createPost.isError && <p role="alert">{createPost.error.message}</p>}
    </form>
  )
}
```

:::

::: warning
Um 400 declarado resolve a mutation. Chega a `onSuccess` e a `data`, não a `onError`. Verifique `status` antes de invalidar ou redireccionar.
:::

`["posts", "list"]` é um prefixo de todas as chaves de `posts.list`, por isso uma só chamada invalida todas as páginas e filtros da lista. Veja [Chaves de query](#chaves-de-query). Para mostrar o post novo antes da resposta do servidor, veja [Actualizações optimistas](./recipes/optimistic-updates). Para escrever uma edição directamente na cache do post, veja [Actualizar a cache a partir de uma mutation](./recipes/update-from-mutation).

## Prefetch

`initQueryOptions` devolve as mesmas chaves e funções de query que os hooks, sem os chamar. Exporte-o do mesmo módulo da API, ao lado dos hooks:

::: code-group

```ts [src/api/posts.ts]
import { initClient } from "typed-api-contract/client"
import { initQueryHooks, initQueryOptions } from "typed-api-contract/react-query"
import { postsContract } from "./posts.contract"

export const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
})

export const postsHooks = initQueryHooks(postsContract, postsClient)
export const postsOptions = initQueryOptions(postsContract, postsClient)
```

:::

Faça prefetch de um post quando o utilizador aponta para a sua ligação. Quando `PostTitle` monta com esse id, mostra o post em cache de imediato, porque o hook constrói a mesma chave.

::: code-group

```tsx [src/posts/PostLink.tsx]
import { useQueryClient } from "@tanstack/react-query"
import { postsOptions } from "../api/posts"

interface PostLinkProps {
  postId: string
  title: string
}

export function PostLink({ postId, title }: PostLinkProps) {
  const queryClient = useQueryClient()

  function prefetchPost() {
    void queryClient.prefetchQuery(
      postsOptions.posts.getById({ params: { id: postId } }),
    )
  }

  return (
    <a
      href={`/posts/${postId}`}
      onMouseEnter={prefetchPost}
      onFocus={prefetchPost}
    >
      {title}
    </a>
  )
}
```

:::

As opções também funcionam em qualquer sítio onde o TanStack aceite `queryOptions`, como `useQuery`, `ensureQueryData` num loader do router e hidratação.

## Chaves de query

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
