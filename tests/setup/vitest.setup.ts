import { cleanup } from "@testing-library/react"
import { afterAll, afterEach, beforeAll } from "vitest"
import { mswServer } from "./msw-server"

beforeAll(() => {
  mswServer.listen({ onUnhandledRequest: "error" })
})

afterEach(() => {
  cleanup()
  mswServer.resetHandlers()
})

afterAll(() => {
  mswServer.close()
})
