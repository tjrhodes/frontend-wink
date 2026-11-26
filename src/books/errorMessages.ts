/**
 * Everything about what can go wrong talking to Google, in one place:
 * how to recognise each problem, and the sentence a person can act on.
 */

/** The HTTP status of a failed request (or RTK Query's "FETCH_ERROR" when Google couldn't be reached). */
function statusOf(error: unknown): unknown {
  return (error as { status?: unknown } | undefined)?.status;
}

/** Google's way of saying "slow down": too many requests (HTTP 429). */
export function isRateLimited(error: unknown): boolean {
  return statusOf(error) === 429;
}

/** A request we aborted on purpose, because a newer search replaced it. */
function wasCancelled(error: unknown): boolean {
  return (error as { name?: unknown } | undefined)?.name === "AbortError";
}

/** The message to show, or null when there's nothing to show (a search we cancelled ourselves). */
export function messageForRequestError(error: unknown): string | null {
  if (wasCancelled(error)) return null;
  if (isRateLimited(error))
    return "Google is limiting how fast this app can search. Pause for a few seconds, then carry on typing.";
  if (statusOf(error) === "FETCH_ERROR") return "Google Books can't be reached. Check your connection and try again.";
  if (statusOf(error) === 404 || statusOf(error) === 503) return "Google Books doesn't know this book.";
  return "Google Books couldn't answer this time. Please try again.";
}
