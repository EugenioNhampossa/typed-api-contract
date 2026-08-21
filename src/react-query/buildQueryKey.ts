import { QUERY_KEY_EMPTY_PART } from "./constants.js"

interface QueryKeyArgs {
  params?: unknown
  query?: unknown
}

/**
 * Builds a stable TanStack Query key from the contract route path and call args.
 */
export function buildQueryKey(
  routePath: readonly string[],
  args: QueryKeyArgs = {},
): readonly [...string[], unknown, unknown] {
  return [
    ...routePath,
    args.params ?? QUERY_KEY_EMPTY_PART,
    args.query ?? QUERY_KEY_EMPTY_PART,
  ]
}
