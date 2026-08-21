import { isAppRoute } from "../contract/index.js"
import { isRecord } from "../shared/isRecord.js"
import { createRouteHook } from "./createRouteHook.js"

export function createQueryHooksTree(
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
      tree[key] = createRouteHook(client, nextPath, value)
      continue
    }

    tree[key] = createQueryHooksTree(value, client, nextPath)
  }

  return tree
}
