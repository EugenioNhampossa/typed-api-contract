/**
 * Turns a query object into a search string (including the leading `?`).
 * Return `""` when there is nothing to send.
 */
export type QuerySerializer = (query: Record<string, unknown>) => string
