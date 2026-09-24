import type { AppRoute } from "../contract/index.js"
import { extractPathParamNames } from "./extractPathParamNames.js"
import { getZodObjectKeys } from "./getZodObjectKeys.js"
import { isZodSchema } from "./isZodSchema.js"

/**
 * Ensures path `:params` and `pathParams` schema keys agree.
 *
 * @throws {Error} when a path placeholder has no schema key, or a schema key
 *   has no matching placeholder.
 */
export function assertPathParamsMatch(route: AppRoute): void {
  const pathNames = extractPathParamNames(route.path)

  if (!isZodSchema(route.pathParams)) {
    if (pathNames.length > 0) {
      throw new Error(
        `Route ${route.method} ${route.path} has path params [${pathNames.join(", ")}] but no pathParams schema`,
      )
    }
    return
  }

  const schemaKeys = getZodObjectKeys(route.pathParams)
  if (schemaKeys === null) {
    throw new Error(
      `Route ${route.method} ${route.path} pathParams must be a Zod object schema`,
    )
  }

  const missingInSchema = pathNames.filter((name) => !schemaKeys.includes(name))
  if (missingInSchema.length > 0) {
    throw new Error(
      `Route ${route.method} ${route.path} path params [${missingInSchema.join(", ")}] are missing from pathParams`,
    )
  }

  const missingInPath = schemaKeys.filter((key) => !pathNames.includes(key))
  if (missingInPath.length > 0) {
    throw new Error(
      `Route ${route.method} ${route.path} pathParams keys [${missingInPath.join(", ")}] are missing from the path`,
    )
  }
}
