/**
 * The live search: a new request for every character typed, as the brief asks.
 *
 * Typing fast starts many requests, and they can come back in any order.
 * Two things keep the screen honest:
 * 1. When a different search replaces one still in flight, the old request
 *    is cancelled (a real abort: the browser stops waiting for it).
 * 2. RTK Query only shows the answer for the latest search, so a slow, old
 *    answer can never replace a newer one.
 *
 * Cancelling happens only when a *different* search starts, never in an
 * effect clean-up. In development React runs every effect twice on arrival
 * (start, clean up, start again). Had the clean-up cancelled the search, the
 * second start would be handed that same, cancelled request (RTK Query shares
 * a request already under way for the same search), and a page opened with
 * ?q=… would wait forever.
 */
import { useEffect, useRef } from "react";
import { searchRequestFor, useLazySearchBooksQuery, type BookSearchRequest } from "./booksApi";

type PendingSearch = { request: BookSearchRequest; abort: () => void };

export function useLiveBookSearch({ query, page, pageSize }: BookSearchRequest) {
  const [startSearch, searchState] = useLazySearchBooksQuery();
  const latestSearch = useRef<PendingSearch | null>(null);
  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    if (!hasQuery) return;
    const request = searchRequestFor({ query, page, pageSize }, page);
    if (latestSearch.current && !isSameSearch(latestSearch.current.request, request)) latestSearch.current.abort();
    // `true` = use a cached answer if we have one, instead of asking Google again.
    const { abort } = startSearch(request, true);
    latestSearch.current = { request, abort };
  }, [hasQuery, query, page, pageSize, startSearch]);

  return { ...searchState, hasQuery };
}

function isSameSearch(first: BookSearchRequest, second: BookSearchRequest): boolean {
  return first.query === second.query && first.page === second.page && first.pageSize === second.pageSize;
}
