---
title: Interceptores
description: Corra onRequest, onResponse e onError à volta de cada chamada, incluindo uma nova tentativa.
---

# Interceptores

Depois desta página consegue alterar um pedido, inspeccionar a resposta no fio, recuperar de uma falha ou repetir uma chamada uma vez.

Passe `interceptors` a `initClient`. Cada chamada corre-os por ordem no array:

```text
construir o pedido
onRequest
fetch
mapear o corpo
onResponse
análise Zod e verificação do estado
```

`onResponse` corre antes de `UnexpectedStatusError` e antes do Zod. Vê estados não declarados. O Zod continua a validar o que sair da cadeia.

```ts
import type { ClientInterceptor } from "typed-api-contract/client"

const trace: ClientInterceptor = {
  onRequest(request) {
    request.headers.set("X-Request-Id", requestId)
    return request
  },
  onResponse(_request, response) {
    return response
  },
  onError(_request, error) {
    throw error
  },
}
```

`onRequest` tem de devolver o `ClientRequest` (ou uma promise dele). `onResponse` tem de devolver o `ClientResponse`.

## Quando onError corre

`onError` corre se o `fetch` rejeitar, se a análise JSON falhar, ou se a validação de estado e Zod lançar. Três resultados:

- Lançar (ou relançar) para parar a cadeia. Os interceptores seguintes não vêem o erro.
- Devolver um `ClientResponse` para recuperar. Essa resposta é analisada com Zod uma vez e não volta a passar por `onError`.
- Chamar `ctx.retry(request?)` para correr outra vez `onRequest`, `fetch` e `onResponse`.

::: warning
`retry()` corre uma vez por chamada. Um segundo `retry()` lança `Error`. A nova tentativa não entra outra vez em `onError`.
:::

```ts
import type { ClientInterceptor, ClientResponse } from "typed-api-contract/client"

const recoverOnNetworkError: ClientInterceptor = {
  async onError(_request, error, _ctx) {
    if (!(error instanceof TypeError)) {
      throw error
    }

    const recovered: ClientResponse = {
      status: 200,
      body: fallbackBody,
      headers: new Headers(),
      raw: new Response(),
    }

    return recovered
  },
}

const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
  interceptors: [trace, recoverOnNetworkError],
})
```

`fallbackBody` tem de corresponder ao esquema Zod do estado que devolve, porque a análise continua a correr.

A direcção é sempre esta: o pedido sai, a resposta volta, e só depois o contrato decide se o estado é válido. A [renovação da autenticação](./auth) é este caminho de nova tentativa, com uma actualização partilhada para 401 concorrentes.

Seguinte: [Renovação da autenticação](./auth).
