/**
 * Appends a query value, expanding arrays into repeated keys.
 */
export function appendQueryValue(
  searchParams: URLSearchParams,
  key: string,
  value: unknown,
): void {
  if (value === undefined) {
    return
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (item === undefined) {
        continue
      }

      searchParams.append(key, String(item))
    }
    return
  }

  searchParams.append(key, String(value))
}
