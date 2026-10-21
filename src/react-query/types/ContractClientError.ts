import type { ZodError } from "zod"
import type {
  AuthUnauthorizedError,
  UnexpectedStatusError,
} from "../../client/index.js"

/**
 * Errors a route caller may surface through TanStack Query `error`.
 *
 * - {@link UnexpectedStatusError}: the response status has no schema on the route.
 * - {@link AuthUnauthorizedError}: the auth-refresh interceptor's retry is still unauthorized.
 * - {@link ZodError}: the response body failed its schema when `validateResponse` is set, or request args failed when `validateRequest` is set.
 * - `Error`: another failure, such as a rejected `fetch`.
 */
export type ContractClientError =
  | UnexpectedStatusError
  | AuthUnauthorizedError
  | ZodError
  | Error
