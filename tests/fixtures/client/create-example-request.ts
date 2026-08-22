import { HTTP_METHOD } from "typed-api-contract"
import type { ClientRequest } from "../../../src/client/types/ClientInterceptor"

export function createExampleRequest(
  overrides: Partial<ClientRequest> = {},
): ClientRequest {
  return {
    url: "https://api.example.com/posts/1",
    method: HTTP_METHOD.GET,
    headers: new Headers(),
    body: undefined,
    signal: undefined,
    route: {
      method: HTTP_METHOD.GET,
      path: "/posts/:id",
      responses: {},
    },
    ...overrides,
  }
}
