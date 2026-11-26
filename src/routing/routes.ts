/**
 * The app's addresses, and the one translation between an address and a "route".
 *
 * The URL is the single source of truth for what the app shows. Everything
 * else (Redux, the views) reads the route that comes out of `routeFromUrl`,
 * and every link is built by `urlForRoute`. Those two functions are the only
 * places that know what the addresses look like.
 *
 *   /?q=dune&page=2&size=20   search results
 *   /book/abc123              one book
 */
import { DEFAULT_PAGE_SIZE, PAGE_SIZES, type PageSize } from "../config";

export type SearchRoute = { name: "search"; query: string; page: number; pageSize: PageSize };
export type BookRoute = { name: "book"; bookId: string };
export type NotFoundRoute = { name: "notFound" };
export type Route = SearchRoute | BookRoute | NotFoundRoute;

const BOOK_PATH = /^\/book\/([^/]+)\/?$/;

/** Reads an address and says which screen it means. */
export function routeFromUrl(url: URL): Route {
  if (url.pathname === "/") return searchRouteFrom(url.searchParams);
  const bookMatch = BOOK_PATH.exec(url.pathname);
  if (bookMatch?.[1]) return { name: "book", bookId: decodeURIComponent(bookMatch[1]) };
  return { name: "notFound" };
}

/** Builds the address for a screen. Default values are left out to keep addresses short. */
export function urlForRoute(route: Route): string {
  if (route.name === "book") return `/book/${encodeURIComponent(route.bookId)}`;
  if (route.name === "notFound") return "/";
  const params = new URLSearchParams();
  if (route.query) params.set("q", route.query);
  if (route.page > 1) params.set("page", String(route.page));
  if (route.pageSize !== DEFAULT_PAGE_SIZE) params.set("size", String(route.pageSize));
  const queryString = params.toString();
  return queryString ? `/?${queryString}` : "/";
}

/** A search with nothing typed yet: where the app starts. */
export function emptySearchRoute(): SearchRoute {
  return { name: "search", query: "", page: 1, pageSize: DEFAULT_PAGE_SIZE };
}

/** Reads the search part of an address, falling back to defaults for anything missing or odd. */
function searchRouteFrom(params: URLSearchParams): SearchRoute {
  return {
    name: "search",
    query: params.get("q") ?? "",
    page: positiveWholeNumber(params.get("page")) ?? 1,
    pageSize: allowedPageSize(params.get("size")) ?? DEFAULT_PAGE_SIZE,
  };
}

/** "3" becomes 3; "0", "-1", "2.5" and "abc" become undefined. */
function positiveWholeNumber(text: string | null): number | undefined {
  const number = Number(text);
  return Number.isInteger(number) && number >= 1 ? number : undefined;
}

/** Only the page sizes the brief allows get through. */
function allowedPageSize(text: string | null): PageSize | undefined {
  return PAGE_SIZES.find((size) => String(size) === text);
}

/**
 * Two routes are on the same "screen" when moving between them shouldn't
 * play a page transition: typing or changing page stays on the search screen,
 * while opening a book (or a different book) is a new screen.
 */
export function screenOf(route: Route): string {
  return route.name === "book" ? `book:${route.bookId}` : route.name;
}
