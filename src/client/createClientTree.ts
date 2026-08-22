import { isAppRoute } from "../contract/index.js"
import { createRouteCaller } from "./createRouteCaller.js"
import { isRecord } from "../shared/isRecord.js"
import type { ClientConfig } from "./types/ClientConfig.js"

export function createClientTree(node: unknown, config: ClientConfig): unknown {
  if (!isRecord(node)) {
    return {}
  }

  const tree: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(node)) {
    if (isAppRoute(value)) {
      tree[key] = createRouteCaller(config, value)
      continue
    }

    tree[key] = createClientTree(value, config)
  }

  return tree
}
