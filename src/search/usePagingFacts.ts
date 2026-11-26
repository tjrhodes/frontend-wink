/**
 * What we can honestly say about the pages of a search.
 *
 * Google's `totalItems` can't be trusted for paging: it grows as you page
 * through (for "kureishi": 472 on page 1, 2,125 by result 30, 13,134 later on),
 * while the real results stop much sooner (around 350 for "kureishi").
 * A "last page" worked out from it points at pages that don't exist.
 *
 * So instead:
 * - the count we show is the estimate from page 1, which doesn't keep growing;
 * - "Next" is offered only while it can lead somewhere: the current page is full,
 *   and a quiet look-ahead at the next page hasn't come back empty.
 *   The look-ahead also means the next page opens instantly, from the cache.
 */
import { useEffect } from "react";
import type { BookSearchResult } from "../books/book";
import { booksApi, searchRequestFor } from "../books/booksApi";
import type { SearchRoute } from "../routing/routes";

/** Wait until typing pauses before looking ahead, so each letter doesn't cost two requests. */
const LOOK_AHEAD_DELAY_MS = 500;

export function usePagingFacts(route: SearchRoute, result: BookSearchResult) {
  const isFullPage = result.books.length >= route.pageSize;
  const nextPage = useLookAhead(route, isFullPage);
  const firstPage = booksApi.endpoints.searchBooks.useQueryState(searchRequestFor(route, 1)).data;
  return {
    // Unknown counts as "maybe": only a next page we've seen come back empty rules it out.
    hasNextPage: isFullPage && nextPage?.books.length !== 0,
    estimatedTotal: firstPage?.totalItems ?? result.totalItems,
  };
}

/** Fetches the next page quietly in the background, and returns it once it's in the cache. */
function useLookAhead(route: SearchRoute, isWorthChecking: boolean) {
  const prefetchSearch = booksApi.usePrefetch("searchBooks");
  const nextRequest = searchRequestFor(route, route.page + 1);
  const { query, page, pageSize } = nextRequest;
  useEffect(() => {
    if (!isWorthChecking) return;
    const timer = setTimeout(() => prefetchSearch({ query, page, pageSize }), LOOK_AHEAD_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isWorthChecking, query, page, pageSize, prefetchSearch]);
  return booksApi.endpoints.searchBooks.useQueryState(nextRequest).data;
}
