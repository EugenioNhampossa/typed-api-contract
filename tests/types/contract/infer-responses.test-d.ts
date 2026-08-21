import { expectTypeOf, test } from "vitest"
import type {
  InferBody,
  InferClientArgs,
  InferPathParams,
  InferQuery,
  InferResponses,
} from "typed-api-contract"
import { contract } from "../../fixtures/contracts/example.contract"

test("InferResponses is a discriminated union on status", () => {
  type GetByIdResponses = InferResponses<typeof contract.posts.getById>

  expectTypeOf<GetByIdResponses>().toEqualTypeOf<
    | { status: 200; body: { id: string; title: string; body: string } }
    | { status: 404; body: { message: string } }
  >()
})

test("route method and path stay literal", () => {
  expectTypeOf(contract.posts.getById.method).toEqualTypeOf<"GET">()
  expectTypeOf(contract.posts.getById.path).toEqualTypeOf<"/posts/:id">()
})

test("missing pathParams, query, and body infer as never", () => {
  expectTypeOf<InferPathParams<typeof contract.posts.getById>>().toEqualTypeOf<{
    id: string
  }>()
  expectTypeOf<InferPathParams<typeof contract.posts.list>>().toEqualTypeOf<never>()

  expectTypeOf<InferQuery<typeof contract.posts.list>>().toEqualTypeOf<{
    page?: number
  }>()
  expectTypeOf<InferQuery<typeof contract.posts.getById>>().toEqualTypeOf<never>()

  expectTypeOf<InferBody<typeof contract.posts.create>>().toEqualTypeOf<{
    title: string
    body: string
  }>()
  expectTypeOf<InferBody<typeof contract.posts.list>>().toEqualTypeOf<never>()
})

test("InferClientArgs requires params when the route declares pathParams", () => {
  expectTypeOf<InferClientArgs<typeof contract.posts.getById>>().toMatchTypeOf<{
    params: { id: string }
  }>()
})
