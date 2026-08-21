import { HTTP_METHOD, type HttpMethod } from "../contract/index.js"

export const HEADER_CONTENT_TYPE = "Content-Type"
export const CONTENT_TYPE_JSON = "application/json"

export const JSON_BODY_METHODS: ReadonlySet<HttpMethod> = new Set([
  HTTP_METHOD.POST,
  HTTP_METHOD.PUT,
  HTTP_METHOD.PATCH,
])
