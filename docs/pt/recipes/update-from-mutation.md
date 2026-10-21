---
title: Actualizar a cache a partir de uma mutation
description: Escreva uma edição bem sucedida na cache da query do post e actualize a lista.
---

# Actualizar a cache a partir de uma mutation

Depois desta página uma edição actualiza de imediato o post aberto, e a lista é obtida de novo para os títulos ficarem sincronizados.

Acrescente a rota ao contrato. A cache guarda o resultado da query, `{ status, body }`, por isso o resultado da mutation pode ser escrito tal como está.

::: code-group

```ts [src/api/posts.contract.ts]
update: {
  method: HTTP_METHOD.PATCH,
  path: "/posts/:id",
  pathParams: z.object({ id: z.string() }),
  body: z.object({ title: z.string(), body: z.string() }),
  responses: {
    200: PostSchema,
    404: z.object({ message: z.string() }),
  },
},
```

:::

::: code-group

```tsx [src/posts/EditPostForm.tsx]
import { useQueryClient } from "@tanstack/react-query"
import type { FormEvent } from "react"
import { buildQueryKey } from "typed-api-contract/react-query"
import { postsHooks } from "../api/posts"

interface EditPostFormProps {
  postId: string
  title: string
  body: string
}

export function EditPostForm({ postId, title, body }: EditPostFormProps) {
  const queryClient = useQueryClient()
  const updatePost = postsHooks.posts.update({
    onSuccess: (result, variables) => {
      if (result.status !== 200) {
        return
      }

      queryClient.setQueryData(
        buildQueryKey(["posts", "getById"], { params: variables.params }),
        result,
      )
      void queryClient.invalidateQueries({ queryKey: ["posts", "list"] })
    },
  })

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    updatePost.mutate({
      params: { id: postId },
      body: {
        title: String(form.get("title")),
        body: String(form.get("body")),
      },
    })
  }

  return (
    <form onSubmit={onSubmit}>
      <input name="title" required defaultValue={title} />
      <textarea name="body" required defaultValue={body} />
      <button type="submit" disabled={updatePost.isPending}>
        Guardar
      </button>
      {updatePost.data?.status === 404 && (
        <p role="alert">{updatePost.data.body.message}</p>
      )}
    </form>
  )
}
```

:::

`buildQueryKey(["posts", "getById"], { params })` é a chave que `postsHooks.posts.getById` lê. Escrever `result.body` não corresponderia a essa cache: o hook lê `query.data.status` e `query.data.body`.

Um 404 é uma mutation bem sucedida com um estado declarado, por isso `onSuccess` corre e a verificação de `status` salta a escrita na cache. A lista só é invalidada depois de um 200, porque um post em falta não alterou nenhum título.

Seguinte: [Renderização no servidor](./server-rendering).
