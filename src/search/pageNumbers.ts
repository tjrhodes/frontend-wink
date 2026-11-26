/**
 * Which page numbers the paginator shows.
 *
 * With many pages, showing them all doesn't fit, so we show the first and last
 * pages, the current one and its neighbours, and a gap ("…") where pages are
 * skipped. For page 6 of 20:   1 … 5 6 7 … 20
 */
export type PageNumberItem = number | "gap";

/** How many pages to show either side of the current one. */
const NEIGHBOURS = 1;

export function pageNumbersAround(currentPage: number, totalPages: number): PageNumberItem[] {
  const pagesToShow = [1, totalPages];
  for (let offset = -NEIGHBOURS; offset <= NEIGHBOURS; offset++) pagesToShow.push(currentPage + offset);
  const sortedPages = [...new Set(pagesToShow)]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((first, second) => first - second);
  return withGaps(sortedPages);
}

/** Puts a "gap" between two pages that aren't next to each other. */
function withGaps(sortedPages: number[]): PageNumberItem[] {
  return sortedPages.flatMap((page, index): PageNumberItem[] => {
    const previousPage = sortedPages[index - 1];
    const skipsPages = previousPage !== undefined && page - previousPage > 1;
    return skipsPages ? ["gap", page] : [page];
  });
}

/** How many pages the results fill. Always at least one, so "page 1 of 1" still makes sense. */
export function countPages(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}
