---
title: Instalação
description: Instale typed-api-contract e Zod. Junte React e TanStack Query só para a entrada React Query.
---

# Instalação

Depois desta página o pacote está instalado e sabe qual o par de que cada importação precisa.

## Requisitos

- Node.js 18.17 ou mais recente
- TypeScript. `strict` é a configuração com que esta biblioteca é testada
- Um consumidor ESM ou um bundler. O pacote é `"type": "module"` e não tem build CommonJS

## Contrato e cliente

`zod` `^4` é um par obrigatório. A entrada do contrato e a entrada do cliente precisam dele.

::: code-group

```bash [npm]
npm i typed-api-contract zod
```

```bash [pnpm]
pnpm add typed-api-contract zod
```

```bash [yarn]
yarn add typed-api-contract zod
```

:::

## React Query

Instale estes pacotes só se importar `typed-api-contract/react-query`. Pares: `react` `^18` ou `^19`, e `@tanstack/react-query` `^5`.

::: code-group

```bash [npm]
npm i react @tanstack/react-query
```

```bash [pnpm]
pnpm add react @tanstack/react-query
```

```bash [yarn]
yarn add react @tanstack/react-query
```

:::

Esse ficheiro de entrada começa com `"use client"`, por isso um Client Component do Next.js App Router pode importar os hooks. `typed-api-contract` e `typed-api-contract/client` são TypeScript simples. Correm em Node 18+ e no browser, e não importam React.

Este pacote não desenha um `QueryClientProvider`. A aplicação monta-o. Veja [React Query](./react-query).

Seguinte: [Primeiros passos](./quickstart).
