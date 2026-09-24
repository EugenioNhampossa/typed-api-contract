import { isRecord } from "../shared/isRecord.js"
import type { AppRoute } from "../contract/index.js"

export interface EncodedRequestBody {
  body: BodyInit | undefined
  setJsonContentType: boolean
}

/**
 * Encodes a route `body` for `fetch` based on `contentType` (default `json`).
 */
export function encodeRequestBody(
  route: AppRoute,
  body: unknown,
): EncodedRequestBody {
  if (body === undefined) {
    return { body: undefined, setJsonContentType: false }
  }

  if (route.contentType === "multipart") {
    return {
      body: toFormData(body),
      setJsonContentType: false,
    }
  }

  return {
    body: JSON.stringify(body),
    setJsonContentType: true,
  }
}

function toFormData(body: unknown): FormData {
  if (typeof FormData !== "undefined" && body instanceof FormData) {
    return body
  }

  if (!isRecord(body)) {
    throw new TypeError(
      "multipart body must be a FormData instance or a plain object",
    )
  }

  const formData = new FormData()

  for (const [key, value] of Object.entries(body)) {
    appendFormValue(formData, key, value)
  }

  return formData
}

function appendFormValue(formData: FormData, key: string, value: unknown): void {
  if (value === undefined) {
    return
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      appendFormValue(formData, key, item)
    }
    return
  }

  if (typeof File !== "undefined" && value instanceof File) {
    formData.append(key, value, value.name)
    return
  }

  if (typeof Blob !== "undefined" && value instanceof Blob) {
    formData.append(key, value, "blob")
    return
  }

  if (typeof value === "string") {
    formData.append(key, value)
    return
  }

  formData.append(key, String(value))
}
