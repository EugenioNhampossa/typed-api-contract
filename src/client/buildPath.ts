import { isRecord } from "../shared/isRecord.js"

/**
 * Replaces `:param` segments in `path` with encoded values from `pathParams`.
 *
 * Each value is passed through `encodeURIComponent`. A placeholder with no
 * matching key, or whose value is `undefined`, is left as `:param`.
 *
 * @example
 * ```ts
 * buildPath("/posts/:id", { id: "a/b" })
 * // "/posts/a%2Fb"
 * ```
 */
export function buildPath(path: string, pathParams: unknown): string {
  if (!isRecord(pathParams)) {
    return path
  }

  let interpolatedPath = path

  for (const [key, value] of Object.entries(pathParams)) {
    if (value === undefined) {
      continue
    }

    interpolatedPath = interpolatedPath.replace(
      `:${key}`,
      encodeURIComponent(String(value)),
    )
  }

  return interpolatedPath
}
