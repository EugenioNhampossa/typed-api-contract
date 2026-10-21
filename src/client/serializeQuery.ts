import { isRecord } from "../shared/isRecord.js"
import { formatSearchParams } from "./formatSearchParams.js"

/**
 * Serializes a query object into a search string starting with `?`.
 * Arrays and objects become `String(value)` (e.g. `"a,b"`). Prefer
 * {@link serializeQueryRepeat} or {@link serializeQueryBrackets} for multi-value keys.
 *
 * @example
 * ```ts
 * serializeQuery({ tags: ["a", "b"] })
 * // "?tags=a%2Cb"
 * ```
 */
export function serializeQuery(query: unknown): string {
  if (!isRecord(query)) {
    return ""
  }

  return formatSearchParams((searchParams) => {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) {
        continue
      }

      searchParams.append(key, String(value))
    }
  })
}
