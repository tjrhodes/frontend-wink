/**
 * Turns whatever went wrong talking to Google into a sentence a person can act on.
 * One place, so every screen explains problems the same way.
 */

/** The message to show, or null when there's nothing to show (a search we cancelled ourselves). */
export function messageForRequestError(error: unknown): string | null {
  if (wasCancelled(error)) return null;
  const status = (error as { status?: unknown } | undefined)?.status;
  if (status === 429)
    return "Google is receiving too many searches from this app right now. Wait a few seconds, then keep typing.";
  if (status === "FETCH_ERROR") return "Google Books can't be reached. Check your connection and try again.";
  if (status === 404 || status === 503) return "Google Books doesn't know this book.";
  return "Google Books couldn't answer this time. Please try again.";
}

/** A request we aborted on purpose, because a newer search replaced it. */
function wasCancelled(error: unknown): boolean {
  return (error as { name?: unknown } | undefined)?.name === "AbortError";
}
