---
title: Primeiros passos
description: Defina um contrato de posts, chame getById e distinga o resultado pelo status.
---

# Primeiros passos

Depois desta página consegue definir uma rota, chamá-la e ler um corpo 200 ou um corpo 404 no mesmo valor devolvido.

## 1. Definir uma rota

Um contrato é uma árvore de rotas. Cada folha tem um método, um caminho e um esquema Zod para cada estado que quer tratar.

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

`posts` é um grupo. `getById` é a rota. O cliente e os hooks usam essas mesmas chaves.

## 2. Criar o cliente

`baseUrl` é a origem da API, sem barra no fim. Os caminhos do contrato começam com `/`.

```ts
import { initClient } from "typed-api-contract/client"

const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
})
```

## 3. Chamar a rota e distinguir o estado

A chave do argumento é `params`, em correspondência com `pathParams` na rota. O resultado é uma união dos estados declarados.

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
404 não é lançado. Está declarado na rota, por isso são dados. Um estado que não está em `responses` lança `UnexpectedStatusError`. Veja [Respostas e erros](./responses).
:::

## Exemplo completo

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

## Seguinte

| Página | O que acrescenta |
| --- | --- |
| [Contrato](./contract) | Aninhamento, parâmetros de caminho, query, corpo e respostas |
| [Cliente](./client) | Cabeçalhos, cancelamento, validação e serialização da query |
| [React Query](./react-query) | `useQuery`, `useMutation` e prefetch |
