/**
 * Returns a signal that aborts when either input aborts.
 *
 * `undefined` inputs are ignored. Uses `AbortSignal.any` when available.
 */
export function combineAbortSignals(
  left: AbortSignal | undefined,
  right: AbortSignal | undefined,
): AbortSignal | undefined {
  if (left === undefined) {
    return right
  }

  if (right === undefined) {
    return left
  }

  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any([left, right])
  }

  const controller = new AbortController()

  if (left.aborted || right.aborted) {
    controller.abort()
    return controller.signal
  }

  const abortFromParent = (): void => {
    controller.abort()
  }

  left.addEventListener("abort", abortFromParent, { once: true })
  right.addEventListener("abort", abortFromParent, { once: true })

  return controller.signal
}
