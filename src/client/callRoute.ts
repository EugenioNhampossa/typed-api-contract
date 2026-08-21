import type { AppRoute, InferClientArgs, InferResponses } from "../contract/index.js"
import { buildPath } from "./buildPath.js"
import {
  CONTENT_TYPE_JSON,
  HEADER_CONTENT_TYPE,
  JSON_BODY_METHODS,
} from "./constants.js"
import { UnexpectedStatusError } from "./errors/UnexpectedStatusError.js"
import { getRecordValue } from "./getRecordValue.js"
import { isZodSchema } from "./isZodSchema.js"
import { parseResponseJson } from "./parseResponseJson.js"
import { serializeQuery } from "./serializeQuery.js"

interface CallRouteParams<R extends AppRoute> {
  baseUrl: string
  route: R
  args: InferClientArgs<R>
}

export async function callRoute<R extends AppRoute>({
  baseUrl,
  route,
  args,
}: CallRouteParams<R>): Promise<InferResponses<R>> {
  const path = buildPath(route.path, getRecordValue(args, "params"))
  const queryString = serializeQuery(getRecordValue(args, "query"))
  const body = getRecordValue(args, "body")
  const url = `${baseUrl}${path}${queryString}`
  const hasJsonBody = JSON_BODY_METHODS.has(route.method) && body !== undefined

  const response = await fetch(url, {
    method: route.method,
    headers: hasJsonBody
      ? { [HEADER_CONTENT_TYPE]: CONTENT_TYPE_JSON }
      : undefined,
    body: hasJsonBody ? JSON.stringify(body) : undefined,
  })

  const schema: unknown = route.responses[response.status]
  if (!isZodSchema(schema)) {
    throw new UnexpectedStatusError({
      method: route.method,
      path: route.path,
      status: response.status,
    })
  }

  const json = await parseResponseJson(response)
  const parsedBody = schema.parse(json)

  return { status: response.status, body: parsedBody } as InferResponses<R>
}
