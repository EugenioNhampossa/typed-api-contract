import { appendQueryValue } from "./appendQueryValue.js"
import { formatSearchParams } from "./formatSearchParams.js"

/**
 * Serializes arrays as repeated keys: `tags=a&tags=b`.
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
