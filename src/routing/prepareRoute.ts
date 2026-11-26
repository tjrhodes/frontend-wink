/**
 * Starts loading what a screen needs while the old screen fades out, so the
 * new one arrives complete. A book page's band can then morph straight to its
 * final height, instead of jumping when the title loads, and its cover is
 * usually ready to show as the page appears.
 */
import type { AppStore } from "../app/store";
import { booksApi } from "../books/booksApi";
import type { Route } from "./routes";

/** On a slow connection we don't wait longer than this: the screen shows its own loading states. */
const LONGEST_WAIT_MS = 1500;
/** A cover is nice to have ready, but not worth holding the page for: after this, it fades in when it arrives. */
const LONGEST_COVER_WAIT_MS = 400;

/**
 * Loads a route's data (only book pages have any), then its cover image.
 * Gives back a function that lets go of our hold on the data once the
 * screen has its own.
 */
export async function prepareRoute(route: Route, store: AppStore): Promise<() => void> {
  if (route.name !== "book") return () => {};
  const loadingBook = store.dispatch(booksApi.endpoints.getBook.initiate(route.bookId));
  const loadingBookAndCover = loadingBook.then(
    ({ data: book }) => book && Promise.race([preloadImage(book.coverUrl), pause(LONGEST_COVER_WAIT_MS)]),
  );
  await Promise.race([loadingBookAndCover, pause(LONGEST_WAIT_MS)]);
  return () => loadingBook.unsubscribe();
}

/** Has the browser fetch and decode an image, so it can be shown instantly later. Never fails. */
function preloadImage(url: string): Promise<void> {
  const image = new Image();
  image.src = url;
  return image.decode().catch(() => undefined);
}

function pause(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
