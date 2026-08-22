import type { AppRoute, InferResponses } from "../contract/index.js"
import { buildPath } from "./buildPath.js"
import { combineAbortSignals } from "./combineAbortSignals.js"
import {
  CONTENT_TYPE_JSON,
  HEADER_CONTENT_TYPE,
  JSON_BODY_METHODS,
} from "./constants.js"
import { getRecordValue } from "./getRecordValue.js"
import { mapFetchResponse } from "./mapFetchResponse.js"
import { mergeHeaders } from "./mergeHeaders.js"
import { parseRouteResponse } from "./parseRouteResponse.js"
import { resolveClientHeaders } from "./resolveClientHeaders.js"
import { runOnError } from "./runOnError.js"
import { runOnRequest } from "./runOnRequest.js"
import { runOnResponse } from "./runOnResponse.js"
import { serializeQuery } from "./serializeQuery.js"
import { toFetchInit } from "./toFetchInit.js"
import type { ClientCallArgs } from "./types/ClientCallArgs.js"
import type { ClientConfig } from "./types/ClientConfig.js"
import type { ClientRequest } from "./types/ClientInterceptor.js"
import { validateRequestArgs } from "./validateRequestArgs.js"

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
  if (config.validateRequest) {
    validateRequestArgs(route, args)
  }

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
  const request: ClientRequest = {
    url,
    method: route.method,
    headers,
    body: hasJsonBody ? JSON.stringify(body) : undefined,
    signal: combineAbortSignals(config.signal, args.signal),
    route,
  }
  const interceptedRequest = await runOnRequest(config.interceptors, request)

  try {
    const fetchResponse = await config.fetch(
      interceptedRequest.url,
      toFetchInit(interceptedRequest, config.credentials),
    )
    const mappedResponse = await mapFetchResponse(fetchResponse)
    const interceptedResponse = await runOnResponse(
      config.interceptors,
      interceptedRequest,
      mappedResponse,
    )
    return parseRouteResponse(route, interceptedResponse)
  } catch (error) {
    const recoveredResponse = await runOnError(
      config.interceptors,
      interceptedRequest,
      error,
    )
    return parseRouteResponse(route, recoveredResponse)
  }
}
