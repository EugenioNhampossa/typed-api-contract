import { expectTypeOf, test } from "vitest"
import {
  initClient,
  type ClientCallArgs,
  type ClientInterceptor,
  type InitClientOptions,
} from "typed-api-contract/client"
import { contract } from "../../fixtures/contracts/example.contract"
import { POSTS_API_BASE_URL } from "../../fixtures/msw/posts.handlers"

test("InitClientOptions requires baseUrl", () => {
  expectTypeOf<InitClientOptions>().toMatchTypeOf<{
    baseUrl: string
    headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>)
    fetch?: typeof fetch
    credentials?: RequestCredentials
    interceptors?: readonly ClientInterceptor[]
    signal?: AbortSignal
    validateRequest?: boolean
  }>()

  const options: InitClientOptions = { baseUrl: POSTS_API_BASE_URL }
  expectTypeOf(options).toMatchTypeOf<InitClientOptions>()

  // @ts-expect-error baseUrl is required
  const missingBaseUrl: InitClientOptions = {}
  void missingBaseUrl
})

test("transport fields are optional on every route", () => {
  const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })
  const signal: AbortSignal | undefined = new AbortController().signal

  client.posts.getById({
    params: { id: "1" },
    headers: { Authorization: "Bearer x" },
    signal,
  })

  client.posts.create({
    body: { title: "Hello", body: "World" },
    headers: { "X-Request-Id": "1" },
  })

  expectTypeOf(client.posts.getById)
    .parameter(0)
    .toMatchTypeOf<{ signal?: AbortSignal }>()
})

test("headers without required params still errors", () => {
  const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })

  // @ts-expect-error params is required
  client.posts.getById({ headers: { Authorization: "x" } })
})

test("ClientCallArgs keeps contract fields and adds transport fields", () => {
  type GetByIdArgs = ClientCallArgs<(typeof contract)["posts"]["getById"]>

  expectTypeOf<GetByIdArgs>().toMatchTypeOf<{
    params: { id: string }
    headers?: HeadersInit
    signal?: AbortSignal
  }>()
})

test("InitClientOptions accepts interceptors", () => {
  const interceptor: ClientInterceptor = {
    onRequest(request) {
      return request
    },
    onResponse(_request, response) {
      return response
    },
    onError(_request, error) {
      throw error
    },
  }

  const recovering: ClientInterceptor = {
    onError(_request, error) {
      void error
      return {
        status: 200,
        body: {},
        headers: new Headers(),
        raw: new Response(),
      }
    },
  }
  void recovering

  const options: InitClientOptions = {
    baseUrl: POSTS_API_BASE_URL,
    interceptors: [interceptor],
    signal: new AbortController().signal,
    validateRequest: true,
  }
  expectTypeOf(options.interceptors).toEqualTypeOf<
    readonly ClientInterceptor[] | undefined
  >()
  expectTypeOf(options.signal).toEqualTypeOf<AbortSignal | undefined>()
  expectTypeOf(options.validateRequest).toEqualTypeOf<boolean | undefined>()
})
