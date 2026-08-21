import { isRecord } from "../shared/isRecord.js"

function isRouteCaller(
  value: unknown,
): value is (args: unknown) => unknown {
  return typeof value === "function"
}

export async function callClientRoute(
  client: unknown,
  routePath: readonly string[],
  args: unknown,
): Promise<unknown> {
  let current: unknown = client

  for (const segment of routePath) {
    if (!isRecord(current)) {
      throw new Error(`Missing client route: ${routePath.join(".")}`)
    }

    current = current[segment]
  }

  if (!isRouteCaller(current)) {
    throw new Error(`Missing client route: ${routePath.join(".")}`)
  }

  return current(args)
}
