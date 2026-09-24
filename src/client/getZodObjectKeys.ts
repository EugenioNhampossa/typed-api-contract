import type { ZodType } from "zod"

/**
 * Returns object-schema keys when `schema` looks like a Zod object; otherwise `null`.
 */
export function getZodObjectKeys(schema: ZodType): readonly string[] | null {
  if (!("shape" in schema)) {
    return null
  }

  const shape: unknown = schema.shape
  if (typeof shape !== "object" || shape === null) {
    return null
  }

  return Object.keys(shape)
}
