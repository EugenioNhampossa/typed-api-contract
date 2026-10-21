---
title: Renderização no servidor
description: Obtenha um post no servidor e passe-o ao hook de query como dados iniciais.
---

# Renderização no servidor

Depois desta página a primeira renderização de um post vem do servidor, e o hook de query assume no browser.

`typed-api-contract/react-query` começa com `"use client"`, por isso um Server Component não pode chamar `initQueryOptions` nem `prefetchQuery`. A entrada do cliente não começa assim. Obtenha os dados com `postsClient` no servidor e passe o resultado ao hook como `initialData`.

Mantenha esse cliente num módulo que não importa `typed-api-contract/react-query`. Reexporte-o do módulo da API em [React Query](../react-query), para os componentes continuarem a importar `postsClient` de `src/api/posts.ts`. Só o Server Component importa `posts.server.ts`.

::: code-group

```ts [src/api/posts.server.ts]
import { initClient } from "typed-api-contract/client"
import { postsContract } from "./posts.contract"

export const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
})

export type PostByIdResult = Awaited<
  ReturnType<typeof postsClient.posts.getById>
>
```

:::

A página é um Server Component. Espera pelo post e renderiza o componente de cliente.

::: code-group

```tsx [src/app/posts/[id]/page.tsx]
import { postsClient } from "../../../../api/posts.server"
import { PostTitle } from "../../../../posts/PostTitle"

interface PostPageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params
  const initialPost = await postsClient.posts.getById({ params: { id } })

  return <PostTitle postId={id} initialPost={initialPost} />
}
```

:::

`initialData` é escrito na cache sob a mesma chave da chamada do hook. `staleTime` mantém esse valor fresco, por isso o browser não volta a obter o post ao montar. Os ramos de espera e de erro tratam obtenções posteriores. Com `initialData`, a primeira renderização não está pendente nem em erro.

::: code-group

```tsx [src/posts/PostTitle.tsx]
"use client"

import type { PostByIdResult } from "../api/posts.server"
import { postsHooks } from "../api/posts"

interface PostTitleProps {
  postId: string
  initialPost: PostByIdResult
}

export function PostTitle({ postId, initialPost }: PostTitleProps) {
  const query = postsHooks.posts.getById(
    { params: { id: postId } },
    { initialData: initialPost, staleTime: 60_000 },
  )

  if (query.isPending) {
    return <p>A carregar</p>
  }

  if (query.isError) {
    return <p role="alert">{query.error.message}</p>
  }

  if (query.data.status === 404) {
    return <p>{query.data.body.message}</p>
  }

  return <h1>{query.data.body.title}</h1>
}
```

:::

`import type` mantém `posts.server.ts` fora do bundle de cliente. O hook volta a obter os dados quando são mais antigos do que `staleTime`, e depois de [uma edição escrever na cache](./update-from-mutation).

Um estado ausente de `responses` lança no servidor, a partir de `postsClient`, antes de `PostTitle` renderizar. Um 404 declarado é um dado e renderiza a mensagem.

O prefetch no browser, por exemplo ao pairar, fica em [`postsOptions`](../react-query#prefetch).
