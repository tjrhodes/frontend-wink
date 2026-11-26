/**
 * Which page numbers the paginator shows.
 *
 * Google's totals can't tell us where the results really end (see
 * usePagingFacts.ts), so we never show a "last page". We show page 1, the
 * two pages before the current one, the current page, and the next page
 * only when we believe it exists. For page 6:   1 … 4 5 6 7
 */
export type PageNumberItem = number | "gap";

/** How many pages to show before the current one. */
const PAGES_BEHIND = 2;

export function pageNumbersAround(currentPage: number, hasNextPage: boolean): PageNumberItem[] {
  const firstShown = Math.max(1, currentPage - PAGES_BEHIND);
  const lastShown = hasNextPage ? currentPage + 1 : currentPage;
  const shownPages = Array.from({ length: lastShown - firstShown + 1 }, (_, offset) => firstShown + offset);
  return [...leadingPages(firstShown), ...shownPages];
}

/** Page 1 is always reachable: shown on its own, with a gap if pages are skipped after it. */
function leadingPages(firstShown: number): PageNumberItem[] {
  if (firstShown === 1) return [];
  return firstShown === 2 ? [1] : [1, "gap"];
}
