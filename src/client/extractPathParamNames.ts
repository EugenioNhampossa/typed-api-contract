/**
 * Extracts `:param` names from a route path template.
 */
export function extractPathParamNames(path: string): readonly string[] {
  const names: string[] = []
  const pattern = /:([A-Za-z_][A-Za-z0-9_]*)/g

  for (const match of path.matchAll(pattern)) {
    const name = match[1]
    if (name !== undefined && !names.includes(name)) {
      names.push(name)
    }
  }

  return names
}
