---
title: Carregamento de ficheiros
description: Envie o corpo de uma rota como FormData, a partir de um objecto simples ou de uma instância FormData.
---

# Carregamento de ficheiros

Depois desta página consegue carregar um ficheiro numa rota cujo corpo é `FormData`, sem definir `Content-Type`.

Defina `contentType: "multipart"`. O esquema do corpo continua a descrever os campos. Quem chama passa esse objecto ou um `FormData` já pronto.

```ts
import { HTTP_METHOD, initContract } from "typed-api-contract"
import { initClient } from "typed-api-contract/client"
import { z } from "zod"

const postsContract = initContract().router({
  posts: {
    upload: {
      method: HTTP_METHOD.POST,
      path: "/uploads",
      contentType: "multipart",
      body: z.object({
        title: z.string(),
        file: z.custom<File>(),
      }),
      responses: { 201: z.object({ id: z.string() }) },
    },
  },
})

const postsClient = initClient(postsContract, {
  baseUrl: "https://api.example.com",
})

const created = await postsClient.posts.upload({
  body: { title: "Cover", file },
})

if (created.status === 201) {
  created.body.id
}
```

Um objecto simples é copiado para `FormData`:

- `undefined` é omitido
- Os arrays acrescentam a mesma chave uma vez por item
- `File` conserva o nome
- `Blob` é acrescentado como `"blob"`
- As strings são acrescentadas tal como estão
- Qualquer outro valor passa por `String(value)`

Passar `FormData` envia essa instância sem alterações.

::: warning
Os pedidos multipart não definem `Content-Type`. A implementação de fetch acrescenta o limite multipart. Se definir o cabeçalho, esse limite perde-se e o servidor não consegue ler as partes.
:::

JSON continua a ser o predefinido. Omita `contentType`, ou use `"json"`, e um corpo declarado é passado a `JSON.stringify` com `Content-Type: application/json`.

Depois de um carregamento com sucesso, invalide a lista com a chave de [React Query](./react-query):

```ts
import { buildQueryKey } from "typed-api-contract/react-query"

await queryClient.invalidateQueries({
  queryKey: buildQueryKey(["posts", "list"]),
})
```

A forma óptima de confirmar o contrato, o cliente e os hooks é a referência: [Contrato](./reference/contract), [Cliente](./reference/client), [React Query](./reference/react-query).
