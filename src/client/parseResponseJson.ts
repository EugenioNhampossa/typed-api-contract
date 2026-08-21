export async function parseResponseJson(response: Response): Promise<unknown> {
  const text = await response.text()
  if (text.length === 0) {
    return undefined
  }

  const parsed: unknown = JSON.parse(text)
  return parsed
}
