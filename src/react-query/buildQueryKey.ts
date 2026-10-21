import { QUERY_KEY_EMPTY_PART } from "./constants.js"

interface QueryKeyArgs {
  params?: unknown
  query?: unknown
}

/**
 * Builds a stable TanStack Query key from the contract route path and call args.
 *
 * The key is the route path segments, then `params`, then `query`.
 * A missing `params` or `query` is `null`, so keys stay aligned.
 *
 * @param routePath - Segments from the contract tree, such as `["posts", "list"]`.
 * @param args - `params` and `query` for this call. Defaults to neither.
 * @returns A readonly key safe to pass to `queryKey` or `invalidateQueries`.
 *
 * @remarks
 * Per-call `headers` and `signal` are not part of the key.
 *
 * @example
 * ```ts
 * import { buildQueryKey } from "typed-api-contract/react-query"
 *
 * buildQueryKey(["posts", "list"], { query: { cursor: "a" } })
 * // ["posts", "list", null, { cursor: "a" }]
 * ```
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
