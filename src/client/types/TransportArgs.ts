/**
 * Per-call transport fields accepted by every route caller.
 *
 * These are not part of the contract. Query keys ignore them.
 */
export type TransportArgs = {
  /** Headers merged after the client `headers`. Later entries win. */
  headers?: HeadersInit

  /**
   * Aborts this call.
   *
   * Combined with the client `signal` when both are set.
   */
  signal?: AbortSignal
}
