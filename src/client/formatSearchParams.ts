/**
 * Builds a `?…` search string from a filled `URLSearchParams`.
 */
export function formatSearchParams(
  fill: (searchParams: URLSearchParams) => void,
): string {
  const searchParams = new URLSearchParams()
  fill(searchParams)

  const queryString = searchParams.toString()
  if (queryString.length === 0) {
    return ""
  }

  return `?${queryString}`
}
