import { isRecord } from "../shared/isRecord.js"

/**
 * Replaces `:param` segments in `path` with encoded values from `pathParams`.
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
