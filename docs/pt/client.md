---
title: Cliente
description: Configure initClient, cabeçalhos e cancelamento por chamada, validação e serialização da query.
---

# Cliente

Depois desta página consegue definir as opções partilhadas do cliente, sobrepor cabeçalhos e cancelamento em cada chamada, e escolher como os arrays são escritos na query string.

```ts
import {
  initClient,
  serializeQueryRepeat,
  type ClientInterceptor,
} from "typed-api-contract/client"

const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
  headers: { "X-App": "web" },
  fetch: customFetch,
  credentials: "include",
  signal: pageAbort.signal,
  validateRequest: true,
  validateResponse: true,
  querySerializer: serializeQueryRepeat,
  interceptors: [authInterceptor],
})
```

`postsContract` é o router de [Contrato](./contract). Todas as rotas dessa árvore partilham as opções abaixo. Quantos clientes criar está em [Estrutura](./structure). `customFetch` tem a mesma assinatura que `fetch`. `authInterceptor` é um `ClientInterceptor`. Veja [Interceptores](./interceptors).

## Opções

| Opção | Predefinido | Função |
| --- | --- | --- |
| `baseUrl` | obrigatório | Origem da API, sem barra no fim. Exemplo: `https://api.example.com` |
| `headers` | nenhum | `HeadersInit`, ou uma função síncrona ou assíncrona chamada em cada pedido |
| `fetch` | `globalThis.fetch` | Implementação à medida. É lida quando a chamada corre, não quando o cliente é criado |
| `credentials` | nenhum | Encaminhado como `RequestInit.credentials` |
| `signal` | nenhum | Cancela todos os pedidos. Combinado com um `signal` da chamada quando ambos existem |
| `validateRequest` | `false` | Analisa `params`, `query` e `body` com Zod antes do `fetch` |
| `validateResponse` | `false` | Analisa o corpo da resposta com Zod para o estado que chegou |
| `querySerializer` | `serializeQuery` | Transforma `query` numa string que começa com `?` |
| `interceptors` | `[]` | `onRequest`, `onResponse` e `onError` à volta de cada chamada |

## Cabeçalhos e cancelamento por chamada

Cada função de rota aceita também `headers` e `signal`. Não fazem parte do contrato. As chaves de query ignoram-nos.

```ts
await postsClient.posts.getById({
  params: { id: "1" },
  headers: { "X-Request-Id": requestId },
  signal: controller.signal,
})
```

Ordem de junção dos cabeçalhos. O último ganha:

1. `Content-Type: application/json`, só quando é enviado um corpo JSON
2. `headers` do cliente (o objecto ou a função)
3. `headers` da chamada
4. Alterações feitas em `onRequest`

Um corpo multipart nunca define `Content-Type`. O runtime acrescenta o limite. Veja [Carregamento de ficheiros](./multipart).

Os valores do caminho passam por `encodeURIComponent`. `id: "a/b"` fica `/posts/a%2Fb`.

## Validação do pedido

::: warning
`validateRequest` vem predefinido como `false`. `params`, `query` e `body` do pedido continuam tipados. Só são verificados com Zod quando opta por isso.
:::

Uma análise de pedido falhada lança `ZodError` antes do `fetch`.

## Validação da resposta

::: warning
`validateResponse` vem predefinido como `false`. O corpo da resposta continua tipado pelo esquema do estado. Só é verificado com Zod quando opta por isso.
:::

Uma análise de resposta falhada lança `ZodError`. Um estado sem esquema lança `UnexpectedStatusError` em qualquer dos casos.

## Serializadores da query

O serializador predefinido converte cada valor em string, por isso um array fica um único campo unido por vírgulas. Os valores `undefined` são omitidos.

```ts
import {
  serializeQuery,
  serializeQueryBrackets,
  serializeQueryRepeat,
} from "typed-api-contract/client"

serializeQuery({ tags: ["a", "b"] })
// "?tags=a%2Cb"

serializeQueryRepeat({ tags: ["a", "b"], page: 1 })
// "?tags=a&tags=b&page=1"

serializeQueryBrackets({ tags: ["a", "b"], page: 1 })
// "?tags%5B%5D=a&tags%5B%5D=b&page=1"
```

`URLSearchParams` codifica em percentagem os parêntesis rectos da terceira forma. Passe a função em `querySerializer`. Não se escolhe por rota.

Seguinte: [Respostas e erros](./responses).
