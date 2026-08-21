import { expectTypeOf, test } from "vitest"
import { initClient } from "typed-api-contract/client"
import { contract } from "../../fixtures/contracts/example.contract"
import { POSTS_API_BASE_URL } from "../../fixtures/msw/posts.handlers"

const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })

test("optional query param can be omitted from the query object", () => {
  client.posts.list({ query: {} })
})

test("required query param is rejected when omitted", () => {
  expectTypeOf(client.posts.search).parameter(0).toMatchTypeOf<{
    query: { q: string }
  }>()

  // @ts-expect-error q is required
  client.posts.search({ query: {} })
})
