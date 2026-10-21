---
title: Respostas e erros
description: Distinga estados declarados e trate estados inesperados, falhas Zod e corpos vazios.
---

# Respostas e erros

Depois desta página consegue distinguir um estado de erro declarado de um erro lançado, e tipar um corpo vazio.

Uma chamada resolve para uma união dos estados em `responses`. Cada membro é `{ status, body }`, e `body` é o resultado do esquema desse estado.

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
Um estado declarado são dados, incluindo 4xx e 5xx. O `fetch` não rejeita esses estados, e este cliente não os transforma em excepções. Só um estado ausente de `responses` é lançado.
:::

## Estado inesperado

```ts
import { UnexpectedStatusError } from "typed-api-contract/client"

try {
  await postsClient.posts.getById({ params: { id: "1" } })
} catch (error) {
  if (error instanceof UnexpectedStatusError) {
    error.status
    error.method
    error.path
  }
}
```

`path` é o modelo do contrato, por exemplo `/posts/:id`, não o URL já com o id preenchido. A mensagem é `Unexpected status ${status} for ${method} ${path}`.

## Falhas Zod

Os corpos das respostas são sempre analisados com o esquema do estado que chegou. Um corpo que não corresponde lança `ZodError` do Zod.

`params`, `query` e `body` do pedido lançam `ZodError` só quando [`validateRequest`](./client) é `true`.

## Erros numa query ou mutation

O TanStack Query coloca as falhas em `error`. `ContractClientError` é a união que esses hooks usam:

| Erro | Quando |
| --- | --- |
| `UnexpectedStatusError` | O estado não tem esquema na rota |
| `AuthUnauthorizedError` | A tentativa da [renovação da autenticação](./auth) continua não autorizada |
| `ZodError` | O corpo da resposta falhou o esquema, ou os argumentos do pedido falharam `validateRequest` |
| `Error` | Outra falha, por exemplo o `fetch` a rejeitar |

Importe `UnexpectedStatusError` e `AuthUnauthorizedError` de `typed-api-contract/client`. Importe `ZodError` de `zod`. Importe o tipo `ContractClientError` de `typed-api-contract/react-query`.

## Corpos vazios

Use `z.void()` ou `z.undefined()` para um estado sem corpo, como 204. O `body` analisado é `undefined`.

```ts
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { initClient } from "typed-api-contract/client"
import { z } from "zod"

const postsContract = initContract().router({
  posts: {
    remove: {
      method: HTTP_METHOD.DELETE,
      path: "/posts/:id",
      pathParams: z.object({ id: z.string() }),
      responses: { 204: z.void() },
    },
  },
})

const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
})

const removed = await postsClient.posts.remove({ params: { id: "1" } })

if (removed.status === 204) {
  removed.body
}
```

DELETE envia um corpo JSON quando `body` está declarado. GET não envia corpo.

```ts
remove: {
  method: HTTP_METHOD.DELETE,
  path: "/posts/:id",
  pathParams: z.object({ id: z.string() }),
  body: z.object({ reason: z.string() }),
  responses: { 200: z.object({ deleted: z.boolean() }) },
}

await postsClient.posts.remove({
  params: { id: "1" },
  body: { reason: "duplicate" },
})
```

A recepção de um 204 correcto deixa `body` em `undefined`. Não procure um objecto nesse estado.

Seguinte: [React Query](./react-query).
