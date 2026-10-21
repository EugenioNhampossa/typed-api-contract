---
title: Referência do cliente
description: Exportações de typed-api-contract/client.
---

# Referência do cliente

Importe estes símbolos de `typed-api-contract/client`. O comportamento está nos guias do [cliente](../client), das [respostas](../responses), dos [interceptores](../interceptors) e da [autenticação](../auth).

## Funções

| Exportação | Função |
| --- | --- |
| `initClient` | Constrói um cliente fetch cujas chaves coincidem com o contrato |
| `createAuthRefreshInterceptor` | Renova em 401 (ou `isUnauthorized`) e repete uma vez |
| `buildPath` | Substitui `:param` por valores de `encodeURIComponent`. Uma chave em falta fica como `:param` |
| `serializeQuery` | Query string predefinida. Os arrays ficam um valor unido por vírgulas |
| `serializeQueryRepeat` | Os arrays ficam chaves repetidas: `tags=a&tags=b` |
| `serializeQueryBrackets` | Os arrays ficam chaves com parêntesis rectos: `tags[]=a&tags[]=b` (os parêntesis são codificados em percentagem) |

## Classes

| Exportação | Função |
| --- | --- |
| `UnexpectedStatusError` | O estado não estava declarado. Campos: `method`, `path`, `status` |
| `AuthUnauthorizedError` | A nova tentativa da renovação continua não autorizada. Campo: `response` |

## Tipos

| Exportação | Função |
| --- | --- |
| `InitClientOptions` | `baseUrl` e as definições opcionais do cliente |
| `ClientInterceptor` | `onRequest`, `onResponse`, `onError` |
| `ClientRequest` | URL, método, cabeçalhos, corpo, signal e a rota, depois de o cliente construir a chamada |
| `ClientResponse` | `status`, `body`, `headers` e o `Response` original |
| `ClientErrorContext` | `retry()`, que volta a correr a chamada uma vez |
| `ClientCallArgs` | Argumentos do contrato mais `headers` e `signal` opcionais |
| `TransportArgs` | A metade `headers` e `signal` de `ClientCallArgs` |
| `QuerySerializer` | `(query: Record<string, unknown>) => string`, incluindo o `?` inicial |
| `InferClient` | A árvore de funções que `initClient` devolve para um contrato |
| `CreateAuthRefreshInterceptorOptions` | `refresh`, `getAccessToken` opcional, `isUnauthorized` opcional |
