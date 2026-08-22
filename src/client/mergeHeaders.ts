/**
 * Merges header sources in order. Later sources overwrite earlier keys.
 */
export function mergeHeaders(
  sources: readonly (HeadersInit | undefined)[],
): Headers {
  const merged = new Headers()

  for (const source of sources) {
    if (source === undefined) {
      continue
    }

    new Headers(source).forEach((value, key) => {
      merged.set(key, value)
    })
  }

  return merged
}
