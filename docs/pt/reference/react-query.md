---
title: Referência React Query
description: Exportações de typed-api-contract/react-query.
---

# Referência React Query

Importe estes símbolos de `typed-api-contract/react-query`. O módulo começa com `"use client"`. O comportamento está nos guias de [React Query](../react-query) e de [paginação por cursor](../pagination).

## Funções

| Exportação | Função |
| --- | --- |
| `initQueryHooks` | Árvore de hooks. GET é `useQuery`. Os outros métodos são `useMutation`. GET com `infinite` tem também `.infinite` |
| `initQueryOptions` | As mesmas chaves e funções, para `useQuery`, `prefetchQuery` e `useInfiniteQuery` |
| `buildQueryKey` | `[...routePath, paramsOrNull, queryOrNull]`. Ignora `headers` e `signal` |

## Tipos

| Exportação | Função |
| --- | --- |
| `InferQueryHooks` | O tipo da árvore de hooks de um contrato |
| `InferQueryOptions` | O tipo da árvore de opções de um contrato |
| `ContractClientError` | `UnexpectedStatusError`, `AuthUnauthorizedError`, `ZodError` ou `Error` |
