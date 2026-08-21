import { isRecord } from "../shared/isRecord.js"

export function serializeQuery(query: unknown): string {
  if (!isRecord(query)) {
    return ""
  }

  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      continue
    }

    searchParams.append(key, String(value))
  }

  const queryString = searchParams.toString()
  if (queryString.length === 0) {
    return ""
  }

  return `?${queryString}`
}
