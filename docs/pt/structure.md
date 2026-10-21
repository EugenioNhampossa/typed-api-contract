---
title: Estrutura
description: Um cliente por origem, um ficheiro por controlador, e um prefixo de caminho para cada serviço atrás de um gateway.
---

# Estrutura

Depois desta página consegue dividir as rotas num ficheiro por controlador, partilhar um cliente entre serviços no mesmo gateway, e acrescentar um cliente quando a origem muda.

Uma origem tem um cliente. A árvore do contrato é a forma como os componentes chamam essa origem. O prefixo do caminho e as chaves do objecto escolhem-se à parte.

## Um cliente por origem

`baseUrl`, cabeçalhos, credenciais e interceptores pertencem a um `initClient`, e todas as rotas da árvore os usam. Controladores no mesmo host pertencem a essa árvore. Um host ou um esquema de autenticação próprio recebe outro `initClient`. A aplicação continua a ter um `QueryClientProvider`. A lista de opções está em [Cliente](./client).

## Um ficheiro por controlador

`router()` devolve a árvore sem a alterar, por isso cada controlador é um router no seu ficheiro e a raiz aninha-os. Um nível por controlador. Acrescente um nível mais fundo quando a API é uma hierarquia real, como `admin.orgs.teams`.

::: code-group

```ts [src/api/posts.contract.ts]
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { z } from "zod"
import { PostSchema } from "./schemas"

export const postsContract = initContract().router({
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
})
```

```ts [src/api/billing.contract.ts]
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { z } from "zod"
import { InvoiceSchema } from "./schemas"

const BILLING = "/billing"

export const billingContract = initContract().router({
  invoices: {
    list: {
      method: HTTP_METHOD.GET,
      path: `${BILLING}/invoices`,
      responses: { 200: z.array(InvoiceSchema) },
    },
    getById: {
      method: HTTP_METHOD.GET,
      path: `${BILLING}/invoices/:id`,
      pathParams: z.object({ id: z.string() }),
      responses: { 200: InvoiceSchema },
    },
  },
})
```

```ts [src/api/contract.ts]
import { initContract } from "typed-api-contract"
import { billingContract } from "./billing.contract"
import { postsContract } from "./posts.contract"

export const apiContract = initContract().router({
  posts: postsContract,
  billing: billingContract,
})
```

:::

Os componentes chamam `apiHooks.posts.getById` e `apiHooks.billing.invoices.getById`. As chaves do objecto são a chave de query, por isso invalidar `["billing"]` deixa todas as queries de `posts` em cache. Dê às chaves o nome da forma como invalida.

## Prefixo do gateway

O nome do grupo não é escrito no URL. Uma chamada faz fetch de `baseUrl` mais o `path` dessa rota. Serviços atrás de um gateway distinguem-se por um prefixo, por isso guarde o prefixo numa constante ao lado do contrato e use-a em todos os caminhos do ficheiro. `BILLING`, acima, é essa constante.

```ts
await apiClient.billing.invoices.getById({ params: { id: "1" } })
// GET https://gateway.example.com/billing/invoices/1
```

A chave de query dessa chamada é `["billing", "invoices", "getById", { id: "1" }, null]`. Vem das chaves do objecto, depois `params`, depois `query`.

Uma rota aninhada em `billing` cujo `path` é `/invoices` é enviada para `/invoices`. A chave do pai não preenche o prefixo em falta.

## O módulo que os componentes importam

Crie o cliente, os hooks e as opções uma única vez, no módulo dessa origem. Os componentes importam-nos daí.

::: code-group

```ts [src/api/api.ts]
import { initClient } from "typed-api-contract/client"
import { initQueryHooks, initQueryOptions } from "typed-api-contract/react-query"
import { apiContract } from "./contract"

export const apiClient = initClient(apiContract, {
  baseUrl: "https://gateway.example.com",
})

export const apiHooks = initQueryHooks(apiContract, apiClient)
export const apiOptions = initQueryOptions(apiContract, apiClient)
```

:::

Passe o mesmo contrato a `initClient`, `initQueryHooks` e `initQueryOptions`. As chaves mantêm-se alinhadas: `billing.invoices.getById` no contrato é `apiClient.billing.invoices.getById` e `apiHooks.billing.invoices.getById`.

`typed-api-contract/react-query` começa com `"use client"`. Um Server Component importa um módulo que só chama `initClient`, e `api.ts` reexporta esse cliente para o browser. Veja [React Query](./react-query) e [Renderização no servidor](./recipes/server-rendering).

## Uma segunda origem

Um serviço noutro host, ou um que precise do seu próprio interceptor de autenticação, é uma segunda configuração. O aninhamento não consegue dar a `billing` o seu próprio `baseUrl`.

::: code-group

```ts [src/api/billing/api.ts]
import { initClient } from "typed-api-contract/client"
import { initQueryHooks } from "typed-api-contract/react-query"
import { billingContract } from "./contract"

export const billingClient = initClient(billingContract, {
  baseUrl: "https://billing.example.com",
  interceptors: [billingAuth],
})

export const billingHooks = initQueryHooks(billingContract, billingClient)
```

:::

Ambos os clientes renderizam sob o mesmo `QueryClientProvider`. Duas árvores que partilham um `QueryClient` precisam de chaves de raiz diferentes. A chave de cache é o caminho do objecto, não o URL, por isso dois contratos que começam ambos em `list` partilham `["list", ...]`.

## Esquemas partilhados

Um objecto Zod usado por mais do que um controlador vive num ficheiro de esquemas, e os ficheiros de rotas importam-no. Partilhe um contrato entre origens só quando ambas expõem as mesmas rotas.

Seguinte: [Cliente](./client).
