import { isAppRoute } from "../contract/index.js"
import { createRouteCaller } from "./createRouteCaller.js"
import { isRecord } from "../shared/isRecord.js"

export function createClientTree(node: unknown, baseUrl: string): unknown {
  if (!isRecord(node)) {
    return {}
  }

  const tree: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(node)) {
    if (isAppRoute(value)) {
      tree[key] = createRouteCaller(baseUrl, value)
      continue
    }

    tree[key] = createClientTree(value, baseUrl)
  }

  return tree
}
