import { appendQueryValue } from "./appendQueryValue.js"
import { formatSearchParams } from "./formatSearchParams.js"

/**
 * Serializes arrays as bracket keys: `tags[]=a&tags[]=b`.
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
