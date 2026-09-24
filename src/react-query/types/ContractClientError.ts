import type { ZodError } from "zod"
import type {
  AuthUnauthorizedError,
  UnexpectedStatusError,
} from "../../client/index.js"

/**
 * Errors the client may surface through TanStack Query `error`.
 */
export type ContractClientError =
  | UnexpectedStatusError
  | AuthUnauthorizedError
  | ZodError
  | Error
