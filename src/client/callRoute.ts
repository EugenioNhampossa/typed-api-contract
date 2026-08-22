import type { AppRoute, InferResponses } from "../contract/index.js"
import { buildPath } from "./buildPath.js"
import {
  CONTENT_TYPE_JSON,
  HEADER_CONTENT_TYPE,
  JSON_BODY_METHODS,
} from "./constants.js"
import { UnexpectedStatusError } from "./errors/UnexpectedStatusError.js"
import { getRecordValue } from "./getRecordValue.js"
import { isZodSchema } from "./isZodSchema.js"
import { mergeHeaders } from "./mergeHeaders.js"
import { parseResponseJson } from "./parseResponseJson.js"
import { resolveClientHeaders } from "./resolveClientHeaders.js"
import { serializeQuery } from "./serializeQuery.js"
import type { ClientCallArgs } from "./types/ClientCallArgs.js"
import type { ClientConfig } from "./types/ClientConfig.js"

interface CallRouteParams<R extends AppRoute> {
  config: ClientConfig
  route: R
  args: ClientCallArgs<R>
}

export async function callRoute<R extends AppRoute>({
  config,
  route,
  args,
}: CallRouteParams<R>): Promise<InferResponses<R>> {
  const path = buildPath(route.path, getRecordValue(args, "params"))
  const queryString = serializeQuery(getRecordValue(args, "query"))
  const body = getRecordValue(args, "body")
  const url = `${config.baseUrl}${path}${queryString}`
  const hasJsonBody = JSON_BODY_METHODS.has(route.method) && body !== undefined
  const headers = mergeHeaders([
    hasJsonBody ? { [HEADER_CONTENT_TYPE]: CONTENT_TYPE_JSON } : undefined,
    await resolveClientHeaders(config.headers),
    args.headers,
  ])

  const response = await config.fetch(url, {
    method: route.method,
    headers,
    body: hasJsonBody ? JSON.stringify(body) : undefined,
    signal: args.signal,
    credentials: config.credentials,
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
