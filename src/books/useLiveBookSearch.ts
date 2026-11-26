/**
 * The live search: a new request for every character typed, as the brief asks.
 *
 * Typing fast starts many requests, and they can come back in any order.
 * Two things keep the screen honest:
 * 1. Each time the search changes, the previous request is cancelled
 *    (a real abort: the browser stops waiting for it).
 * 2. RTK Query only shows the answer for the latest search, so a slow, old
 *    answer can never replace a newer one.
 */
import { useEffect } from "react";
import { searchRequestFor, useLazySearchBooksQuery, type BookSearchRequest } from "./booksApi";

export function useLiveBookSearch({ query, page, pageSize }: BookSearchRequest) {
  const [startSearch, searchState] = useLazySearchBooksQuery();
  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    if (!hasQuery) return;
    // `true` = use a cached answer if we have one, instead of asking Google again.
    const pendingSearch = startSearch(searchRequestFor({ query, page, pageSize }, page), true);
    // Runs when the search changes or the screen closes: cancel what's still in flight.
    return () => pendingSearch.abort();
  }, [hasQuery, query, page, pageSize, startSearch]);

  return { ...searchState, hasQuery };
}
