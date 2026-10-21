---
title: Renovação da autenticação
description: Renove um token bearer uma vez em 401, mesmo quando várias chamadas falham juntas.
---

# Renovação da autenticação

Depois desta página um 401 renova as credenciais uma vez e repete o pedido. Respostas 401 concorrentes partilham essa renovação.

```ts
import {
  createAuthRefreshInterceptor,
  initClient,
} from "typed-api-contract/client"

let accessToken = ""

const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
  interceptors: [
    createAuthRefreshInterceptor({
      getAccessToken: () => accessToken,
      refresh: async () => {
        accessToken = await refreshAccessToken()
      },
    }),
  ],
})
```

`postsContract` é um contrato de [Contrato](./contract). `refreshAccessToken` é a sua chamada de token.

## O que faz

| Opção | Predefinido | Função |
| --- | --- | --- |
| `refresh` | obrigatório | Carrega credenciais novas. Os 401 concorrentes esperam a mesma promise |
| `getAccessToken` | nenhum | Quando existe, `onRequest` escreve `Authorization: Bearer <token>`, incluindo na nova tentativa |
| `isUnauthorized` | `status === 401` | Decide quais as respostas que renovam |

O interceptor lança `AuthUnauthorizedError` em `onResponse` quando `isUnauthorized` é verdadeiro. `onError` apanha esse erro, chama `refresh` e faz `retry()`. A nova tentativa corre `onRequest` outra vez, por isso `getAccessToken` pode devolver o token novo.

::: warning
A nova tentativa acontece uma vez. Uma segunda resposta não autorizada não é repetida. Quem chama vê `AuthUnauthorizedError`, cujo `response` é o `ClientResponse` não autorizado. Enquanto este interceptor estiver instalado, esse estado não é devolvido como `{ status, body }`, mesmo que a rota o declare.
:::

```ts
import { AuthUnauthorizedError } from "typed-api-contract/client"

try {
  await postsClient.posts.getById({ params: { id: "1" } })
} catch (error) {
  if (error instanceof AuthUnauthorizedError) {
    error.response.status
  }
}
```

Coloque este interceptor no array `interceptors` no ponto em que um 401 deve renovar antes dos `onError` seguintes. Os hooks correm por ordem no array. Veja [Interceptores](./interceptors).

Actualmente o carácter desta recuperação é único: uma actualização, uma nova tentativa, e a excepção fica para o segundo 401.

Seguinte: [Carregamento de ficheiros](./multipart).
