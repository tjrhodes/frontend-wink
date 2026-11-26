/**
 * Starts loading what a screen needs while the old screen fades out, so the
 * new one arrives complete. A book page's band can then morph straight to its
 * final height, instead of jumping when the title loads.
 */
import type { AppStore } from "../app/store";
import { booksApi } from "../books/booksApi";
import type { Route } from "./routes";

/** On a slow connection we don't wait longer than this: the screen shows its own loading state. */
const LONGEST_WAIT_MS = 1500;

/**
 * Loads a route's data (only book pages have any). Gives back a function that
 * lets go of our hold on the data once the screen has its own.
 */
export async function prepareRoute(route: Route, store: AppStore): Promise<() => void> {
  if (route.name !== "book") return () => {};
  const loadingBook = store.dispatch(booksApi.endpoints.getBook.initiate(route.bookId));
  await Promise.race([loadingBook, pause(LONGEST_WAIT_MS)]);
  return () => loadingBook.unsubscribe();
}

function pause(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
