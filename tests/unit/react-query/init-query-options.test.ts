import { describe, expect, it } from "vitest"
import { initClient } from "typed-api-contract/client"
import { initQueryHooks } from "typed-api-contract/react-query"
import { initQueryOptions } from "typed-api-contract/react-query"
import { contract } from "../../fixtures/contracts/example.contract"
import { POSTS_API_BASE_URL } from "../../fixtures/msw/posts.handlers"
import { buildQueryKey } from "../../../src/react-query/buildQueryKey"

describe("initQueryOptions", () => {
  const client = initClient(contract, { baseUrl: POSTS_API_BASE_URL })
  const options = initQueryOptions(contract, client)
  const hooks = initQueryHooks(contract, client)

  it("builds the same query key as hooks / buildQueryKey", () => {
    const args = { params: { id: "1" } }
    const queryOptions = options.posts.getById(args)

    expect(queryOptions.queryKey).toEqual(
      buildQueryKey(["posts", "getById"], args),
    )
    expect(typeof hooks.posts.getById).toBe("function")
  })

  it("exposes mutation options with a mutationFn", () => {
    const mutation = options.posts.create()

    expect(typeof mutation.mutationFn).toBe("function")
  })
})
