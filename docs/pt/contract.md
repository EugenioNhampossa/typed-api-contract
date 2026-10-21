---
title: Contrato
description: Aninhe rotas e declare parâmetros de caminho, query, corpo e um esquema Zod por estado.
---

# Contrato

Depois desta página consegue descrever um router aninhado cujos parâmetros de caminho, query, corpo e respostas estão todos tipados.

`initContract().router(...)` confirma que o valor é um `AppRouter` e conserva as chaves literais. Um valor é uma rota ou outro router, por isso os grupos podem aninhar-se.

```ts
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { z } from "zod"

const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
})

export const postsContract = initContract().router({
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
```

## Campos da rota

| Campo | Obrigatório | Função |
| --- | --- | --- |
| `method` | sim | Um de `HTTP_METHOD`: `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |
| `path` | sim | Começa com `/`. Os marcadores são `:param` |
| `pathParams` | quando o caminho tem marcadores | Objecto Zod. As chaves têm de coincidir com os marcadores |
| `query` | não | Esquema Zod da query string. Omita quando não há query |
| `body` | não | Esquema Zod do corpo do pedido. Omita quando não há corpo |
| `contentType` | não | `"json"` (predefinido) ou `"multipart"`. Veja [Carregamento de ficheiros](./multipart) |
| `infinite` | não | Configuração de cursor numa rota GET. Veja [Paginação por cursor](./pagination) |
| `responses` | sim | Mapa de estado HTTP para um esquema Zod |

Os argumentos da chamada usam `params`, `query` e `body`. Um esquema em falta não é um campo opcional: passar essa chave é um erro de tipo.

```ts
await postsClient.posts.list({ query: { page: 2 } })

await postsClient.posts.create({
  body: { title: "New", body: "Post" },
})
```

`list` tem um esquema `query`, por isso `query` é obrigatório mesmo quando todos os campos são opcionais. Passe `query: {}` para omitir `page`.

## Os parâmetros de caminho têm de coincidir com o caminho

`initClient` compara cada `:param` em `path` com as chaves de `pathParams`.

- Um marcador sem chave no esquema lança um erro.
- Uma chave do esquema sem marcador lança um erro.
- `pathParams` tem de ser um objecto Zod. Um `z.string()` solto lança um erro.
- Um caminho com marcadores e sem `pathParams` lança um erro.

```ts
path: "/posts/:id"
pathParams: z.object({ id: z.string() })
```

O `Error` lançado indica o método, o caminho e as chaves que não coincidem. A verificação corre quando o cliente é criado, não em cada chamada.

A concepção do contrato é esta: uma descrição, e o cliente segue-a sem uma segunda lista de rotas.

Seguinte: [Cliente](./client).
