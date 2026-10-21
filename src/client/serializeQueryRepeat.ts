import { appendQueryValue } from "./appendQueryValue.js"
import { formatSearchParams } from "./formatSearchParams.js"

/**
 * Serializes arrays as repeated keys: `tags=a&tags=b`.
 *
 * @example
 * ```ts
 * serializeQueryRepeat({ tags: ["a", "b"], page: 1 })
 * // "?tags=a&tags=b&page=1"
 * ```
 */
export function serializeQueryRepeat(
  query: Record<string, unknown>,
): string {
  return formatSearchParams((searchParams) => {
    for (const [key, value] of Object.entries(query)) {
      appendQueryValue(searchParams, key, value)
    }
  })
}
