import { expectTypeOf, test } from "vitest"
import { initClient } from "typed-api-contract/client"
import { initQueryHooks } from "typed-api-contract/react-query"
import { contract } from "../../fixtures/contracts/example.contract"
import { POSTS_API_BASE_URL } from "../../fixtures/msw/posts.handlers"

const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })
const hooks = initQueryHooks(contract, client)

test("GET hook requires params and accepts query options", () => {
  expectTypeOf(hooks.posts.getById).parameter(0).toMatchTypeOf<{
    params: { id: string }
  }>()

  hooks.posts.getById(
    { params: { id: "1" } },
    { enabled: true, staleTime: 1000, retry: false },
  )

  hooks.posts.getById({
    params: { id: "1" },
    headers: { Authorization: "Bearer x" },
    signal: new AbortController().signal,
  })

  // @ts-expect-error params is required
  hooks.posts.getById({})
})

test("GET hook data narrows on status", () => {
  const query = hooks.posts.getById({ params: { id: "1" } })

  if (query.data?.status === 200) {
    expectTypeOf(query.data.body).toEqualTypeOf<{
      id: string
      title: string
      body: string
    }>()
  }

  if (query.data?.status === 404) {
    expectTypeOf(query.data.body).toEqualTypeOf<{ message: string }>()
  }
})

test("GET hook select is typed", () => {
  const query = hooks.posts.getById(
    { params: { id: "1" } },
    { select: (data) => data.status },
  )

  expectTypeOf(query.data).toEqualTypeOf<200 | 404 | undefined>()
})

test("mutation mutate requires a typed body", () => {
  const create = hooks.posts.create()

  expectTypeOf(create.mutate).parameter(0).toMatchTypeOf<{
    body: { title: string; body: string }
  }>()

  // @ts-expect-error body is required
  create.mutate({})

  // @ts-expect-error title must be a string
  create.mutate({ body: { title: 1, body: "World" } })
})
