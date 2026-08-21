import { expectTypeOf, test } from "vitest"
import { initClient } from "typed-api-contract/client"
import { initQueryHooks } from "typed-api-contract/react-query"
import { nestedContract } from "../../fixtures/contracts/nested.contract"

const client = initClient(nestedContract, { baseUrl: "http://localhost" })
const hooks = initQueryHooks(nestedContract, client)

test("three-level nested client method is typed", () => {
  expectTypeOf(client.admin.orgs.teams.getById).parameter(0).toMatchTypeOf<{
    params: { orgId: string; teamId: string }
  }>()
})

test("three-level nested hook is typed", () => {
  expectTypeOf(hooks.admin.orgs.teams.getById).parameter(0).toMatchTypeOf<{
    params: { orgId: string; teamId: string }
  }>()
})
