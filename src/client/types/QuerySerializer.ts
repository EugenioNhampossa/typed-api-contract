/**
 * Turns a query object into a search string, including the leading `?`.
 *
 * Return `""` when there is nothing to send.
 *
 * @see {@link serializeQuery}
 * @see {@link serializeQueryRepeat}
 * @see {@link serializeQueryBrackets}
 */
export type QuerySerializer = (query: Record<string, unknown>) => string
