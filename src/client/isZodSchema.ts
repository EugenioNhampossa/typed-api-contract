import type { ZodType } from "zod"

export function isZodSchema(value: unknown): value is ZodType {
  if (typeof value !== "object" || value === null) {
    return false
  }

  if (!("parse" in value)) {
    return false
  }

  return typeof value.parse === "function"
}
