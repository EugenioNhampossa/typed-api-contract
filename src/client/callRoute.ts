import type { AppRoute, InferResponses } from "../contract/index.js"
import { isRecord } from "../shared/isRecord.js"
import { buildPath } from "./buildPath.js"
import { combineAbortSignals } from "./combineAbortSignals.js"
import {
  CONTENT_TYPE_JSON,
  HEADER_CONTENT_TYPE,
  JSON_BODY_METHODS,
} from "./constants.js"
import { encodeRequestBody } from "./encodeRequestBody.js"
import { getRecordValue } from "./getRecordValue.js"
import { mapFetchResponse } from "./mapFetchResponse.js"
import { mergeHeaders } from "./mergeHeaders.js"
import { parseRouteResponse } from "./parseRouteResponse.js"
import { resolveClientHeaders } from "./resolveClientHeaders.js"
import { runOnError } from "./runOnError.js"
import { runOnRequest } from "./runOnRequest.js"
import { runOnResponse } from "./runOnResponse.js"
import { toFetchInit } from "./toFetchInit.js"
import type { ClientCallArgs } from "./types/ClientCallArgs.js"
import type { ClientConfig } from "./types/ClientConfig.js"
import type {
  ClientRequest,
  ClientResponse,
} from "./types/ClientInterceptor.js"
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
  const query = getRecordValue(args, "query")
  const queryString = isRecord(query) ? config.querySerializer(query) : ""
  const rawBody = getRecordValue(args, "body")
  const url = `${config.baseUrl}${path}${queryString}`
  const canSendBody =
    JSON_BODY_METHODS.has(route.method) || route.contentType === "multipart"
  const encoded = canSendBody
    ? encodeRequestBody(route, rawBody)
    : { body: undefined, setJsonContentType: false }
  const headers = mergeHeaders([
    encoded.setJsonContentType
      ? { [HEADER_CONTENT_TYPE]: CONTENT_TYPE_JSON }
      : undefined,
    await resolveClientHeaders(config.headers),
    args.headers,
  ])
  const initialRequest: ClientRequest = {
    url,
    method: route.method,
    headers,
    body: encoded.body,
    signal: combineAbortSignals(config.signal, args.signal),
    route,
  }

  const response = await executeWithInterceptors(config, initialRequest, true)
  return parseRouteResponse(route, response, config.validateResponse)
}

async function executeWithInterceptors(
  config: ClientConfig,
  request: ClientRequest,
  allowRetry: boolean,
): Promise<ClientResponse> {
  const interceptedRequest = await runOnRequest(config.interceptors, request)

  try {
    const fetchResponse = await config.fetch(
      interceptedRequest.url,
      toFetchInit(interceptedRequest, config.credentials),
    )
    const mappedResponse = await mapFetchResponse(fetchResponse)
    return await runOnResponse(
      config.interceptors,
      interceptedRequest,
      mappedResponse,
    )
  } catch (error) {
    if (!allowRetry) {
      throw error
    }

    let hasRetried = false

    return runOnError(
      config.interceptors,
      interceptedRequest,
      error,
      {
        retry: async (nextRequest = interceptedRequest) => {
          if (hasRetried) {
            throw new Error("retry() may only be called once per request")
          }
          hasRetried = true
          return executeWithInterceptors(config, nextRequest, false)
        },
      },
    )
  }
}
