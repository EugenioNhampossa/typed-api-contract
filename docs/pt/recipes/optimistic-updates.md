---
title: Actualizações optimistas
description: Insira um post criado nas listas em cache, reverta em caso de falha e volte a obter os dados quando o pedido termina.
---

# Actualizações optimistas

Depois desta página a lista mostra um post novo antes da resposta do servidor, remove-o quando o pedido falha e substitui-o pelo post do servidor quando o pedido termina.

O hook de mutation gerado tipa o contexto como `unknown`, por isso `onMutate` e `onError` não podem partilhar um valor de reversão tipado. Chame `useMutation` com a `mutationFn` de [`postsOptions`](../react-query#prefetch). As variáveis, o resultado e os erros continuam tipados pelo contrato.

::: code-group

```tsx [src/posts/CreatePostForm.tsx]
import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query"
import type { FormEvent } from "react"
import { postsClient, postsOptions } from "../api/posts"

type PostList = Awaited<ReturnType<typeof postsClient.posts.list>>

interface Rollback {
  previous: [QueryKey, PostList | undefined][]
}

export function CreatePostForm() {
  const queryClient = useQueryClient()
  const createPost = useMutation({
    mutationFn: postsOptions.posts.create().mutationFn,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["posts", "list"] })

      const previous = queryClient.getQueriesData<PostList>({
        queryKey: ["posts", "list"],
      })

      queryClient.setQueriesData<PostList>(
        { queryKey: ["posts", "list"] },
        (current) => {
          if (current?.status !== 200) {
            return current
          }

          return {
            status: 200,
            body: [
              ...current.body,
              {
                id: crypto.randomUUID(),
                title: input.body.title,
                body: input.body.body,
              },
            ],
          }
        },
      )

      return { previous }
    },
    onError: (_error, _input, context: Rollback | undefined) => {
      if (!context) {
        return
      }

      for (const [queryKey, data] of context.previous) {
        queryClient.setQueryData(queryKey, data)
      }
    },
    onSettled: () => {
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

  return (
    <form onSubmit={onSubmit}>
      <input name="title" required />
      <textarea name="body" required />
      <button type="submit" disabled={createPost.isPending}>
        Criar post
      </button>
    </form>
  )
}
```

:::

`["posts", "list"]` corresponde a todas as páginas e filtros da lista que estão em cache. Uma lista que ainda não foi obtida não está na cache, por isso nada é inserido nela. Cada valor em cache é `{ status, body }`, o mesmo valor que o hook de query lê. O post inserido usa um id temporário.

`onError` corre quando o pedido lança um erro e repõe as listas anteriores. Um 400 declarado não lança, por isso não reverte. `onSettled` corre nos dois casos e volta a obter as listas, o que remove o post temporário e mostra o que o servidor gravou.

`postsClient` e `postsOptions` vêm do módulo da API em [React Query](../react-query). `posts.list` devolve `{ status: 200, body: Post[] }`, do contrato em [Primeiros passos](../quickstart).

Seguinte: [Actualizar a cache a partir de uma mutation](./update-from-mutation).
