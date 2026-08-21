import { expectTypeOf, test } from "vitest"
import { initClient } from "typed-api-contract/client"
import { initQueryHooks } from "typed-api-contract/react-query"
import { largeContract } from "../../fixtures/contracts/large.contract"

const client = initClient(largeContract, { baseUrl: "http://localhost" })
const hooks = initQueryHooks(largeContract, client)

test("large contract still infers client methods", () => {
  expectTypeOf(client.resource0.list).toBeFunction()
  expectTypeOf(client.resource49.getById).parameter(0).toMatchTypeOf<{
    params: { id: string }
  }>()
})

test("large contract still infers query hooks", () => {
  expectTypeOf(hooks.resource0.list).toBeFunction()
  expectTypeOf(hooks.resource49.getById).parameter(0).toMatchTypeOf<{
    params: { id: string }
  }>()
})
