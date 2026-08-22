import { describe, expect, it } from "vitest"
import { HTTP_METHOD } from "typed-api-contract"
import { toFetchInit } from "../../../src/client/toFetchInit"
import { createExampleRequest } from "../../fixtures/client/create-example-request"

describe("toFetchInit", () => {
  it("copies method, headers, body, signal, and credentials", () => {
    const headers = new Headers({ Authorization: "Bearer a" })
    const signal = new AbortController().signal
    const init = toFetchInit(
      createExampleRequest({
        method: HTTP_METHOD.POST,
        headers,
        body: "{\"title\":\"Hello\"}",
        signal,
      }),
      "include",
    )

    expect(init).toEqual({
      method: HTTP_METHOD.POST,
      headers,
      body: "{\"title\":\"Hello\"}",
      signal,
      credentials: "include",
    })
  })
})
