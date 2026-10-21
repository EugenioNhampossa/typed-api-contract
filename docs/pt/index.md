---
layout: home

hero:
  name: typed-api-contract
  text: Contratos REST tipados
  tagline: Rotas Zod, um cliente fetch tipado e hooks do TanStack Query.
  actions:
    - theme: brand
      text: Primeiros passos
      link: /pt/quickstart
    - theme: alt
      text: Instalação
      link: /pt/install

features:
  - title: Contrato
    details: Descreva cada rota uma vez. Método, caminho, parâmetros, query, corpo e um esquema Zod por estado.
  - title: Cliente
    details: initClient espelha essa árvore. Uma chamada devolve { status, body } para cada estado declarado.
  - title: React Query
    details: GET passa a useQuery. POST, PUT, PATCH e DELETE passam a useMutation.
---

Depois desta página sabe qual a entrada a importar e quais as predefinições que o cliente já aplica.

## Três entradas

| Importação | Serve para |
| --- | --- |
| `typed-api-contract` | Definir rotas com `initContract` |
| `typed-api-contract/client` | Chamar essas rotas com `fetch` |
| `typed-api-contract/react-query` | Lê-las e escrevê-las através do TanStack Query |

`react` e `@tanstack/react-query` são pares opcionais. Instale-os só quando importar `typed-api-contract/react-query`.

## Como uma chamada é construída

1. `initContract().router(...)` é a fonte de verdade.
2. `initClient` percorre essa árvore e devolve uma função por rota.
3. `initQueryHooks` e `initQueryOptions` chamam essas funções. As rotas GET são queries. Qualquer outro método é uma mutation.

Passe o mesmo contrato ao cliente e aos hooks. As chaves coincidem: `posts.getById` no contrato é `postsClient.posts.getById` e `hooks.posts.getById`.

## Predefinições

- Os corpos das respostas são sempre analisados com o esquema Zod desse estado.
- `params`, `query` e `body` são tipados. Só são analisados em tempo de execução quando `validateRequest` é `true`. O predefinido é `false`.
- Um estado declarado, incluindo 4xx e 5xx, são dados com a forma `{ status, body }`.
- Um estado sem esquema lança [`UnexpectedStatusError`](./responses).

O objectivo desta página é a adopção do contrato como única descrição da API. A secção seguinte trata da instalação.

Seguinte: [Instalação](./install).
