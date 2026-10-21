import { appendQueryValue } from "./appendQueryValue.js"
import { formatSearchParams } from "./formatSearchParams.js"

/**
 * Serializes arrays as bracket keys: `tags[]=a&tags[]=b`.
 *
 * `URLSearchParams` percent-encodes the brackets.
 *
 * @example
 * ```ts
 * serializeQueryBrackets({ tags: ["a", "b"], page: 1 })
 * // "?tags%5B%5D=a&tags%5B%5D=b&page=1"
 * ```
 */
export function serializeQueryBrackets(
  query: Record<string, unknown>,
): string {
  return formatSearchParams((searchParams) => {
    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) {
        appendQueryValue(searchParams, `${key}[]`, value)
        continue
      }

      appendQueryValue(searchParams, key, value)
    }
  })
}
