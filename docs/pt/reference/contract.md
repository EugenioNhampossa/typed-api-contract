---
title: Referência do contrato
description: Exportações de typed-api-contract.
---

# Referência do contrato

Importe estes símbolos de `typed-api-contract`. O comportamento está no [guia do contrato](../contract).

## Funções

| Exportação | Função |
| --- | --- |
| `initContract` | Devolve `router()`, que verifica um `AppRouter` e conserva as chaves literais |
| `isAppRoute` | `true` quando um valor tem um `method` conhecido, um `path` string e `responses`. Não analisa esquemas Zod |

## Valores

| Exportação | Função |
| --- | --- |
| `HTTP_METHOD` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |

## Tipos

| Exportação | Função |
| --- | --- |
| `AppRoute` | Um endpoint: método, caminho, entradas opcionais, `responses` |
| `AppRouter` | Mapa aninhado de rotas e routers |
| `HttpMethod` | Um membro de `HTTP_METHOD` |
| `GetHttpMethod` | O método `"GET"`. As rotas GET passam a queries |
| `RouteContentType` | `"json"` ou `"multipart"` |
| `InfiniteRouteConfig` | `initialPageParam` e `getNextPageParam` para uma rota GET |
| `InferPathParams` | Tipo de `params` de uma rota, ou `never` quando não há `pathParams` |
| `InferQuery` | Tipo de `query` de uma rota, ou `never` quando não há `query` |
| `InferBody` | Tipo de `body` de uma rota, ou `never` quando não há `body` |
| `InferClientArgs` | `params`, `query` e `body` como chaves obrigatórias só quando esse esquema existe |
| `InferResponses` | União de `{ status, body }` para cada estado declarado |

`InferClientArgs` não inclui `headers` nem `signal`. O cliente acrescenta-os em `ClientCallArgs`.
