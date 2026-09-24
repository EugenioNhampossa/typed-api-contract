import { isAppRoute } from "../contract/index.js"
import { isRecord } from "../shared/isRecord.js"
import { createRouteOptions } from "./createRouteOptions.js"

export function createQueryOptionsTree(
  node: unknown,
  client: unknown,
  routePath: readonly string[] = [],
): unknown {
  if (!isRecord(node)) {
    return {}
  }

  const tree: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(node)) {
    const nextPath = [...routePath, key]

    if (isAppRoute(value)) {
      tree[key] = createRouteOptions(client, nextPath, value)
      continue
    }

    tree[key] = createQueryOptionsTree(value, client, nextPath)
  }

  return tree
}
