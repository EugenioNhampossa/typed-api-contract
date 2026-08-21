import { expectTypeOf, test } from "vitest"
import { initClient } from "typed-api-contract/client"
import { contract } from "../../fixtures/contracts/example.contract"
import { POSTS_API_BASE_URL } from "../../fixtures/msw/posts.handlers"

const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })

test("requires params for getById", () => {
  expectTypeOf(client.posts.getById).parameter(0).toMatchTypeOf<{
    params: { id: string }
  }>()

  // @ts-expect-error params is required
  client.posts.getById({})

  // @ts-expect-error id is required
  client.posts.getById({ params: {} })

  // @ts-expect-error extra param keys are not allowed
  client.posts.getById({ params: { id: "1", extra: "x" } })
})

test("requires a typed body for create", () => {
  expectTypeOf(client.posts.create).parameter(0).toMatchTypeOf<{
    body: { title: string; body: string }
  }>()

  // @ts-expect-error body is required
  client.posts.create({})

  // @ts-expect-error title must be a string
  client.posts.create({ body: { title: 1, body: "World" } })
})

test("narrows the response body by status", async () => {
  const res = await client.posts.getById({ params: { id: "1" } })

  if (res.status === 200) {
    expectTypeOf(res.body).toEqualTypeOf<{
      id: string
      title: string
      body: string
    }>()
  }

  if (res.status === 404) {
    expectTypeOf(res.body).toEqualTypeOf<{ message: string }>()
  }
})
