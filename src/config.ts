/**
 * Every fixed value of the app, in one place.
 * If the brief states it as a value, it is written here once.
 */

/** The Google Books endpoint the brief asks us to use. */
export const GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes";

/**
 * An optional Google API key, from the VITE_GOOGLE_BOOKS_API_KEY environment variable.
 * Without one, Google allows only a small number of requests, and a live
 * search spends them quickly.
 */
export const GOOGLE_BOOKS_API_KEY: string | undefined = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || undefined;

/** The brief's accepted page sizes, and the one used when the address doesn't say. */
export const PAGE_SIZES = [5, 10, 15, 20] as const;
export type PageSize = (typeof PAGE_SIZES)[number];
export const DEFAULT_PAGE_SIZE: PageSize = 10;

/** The cover to show when Google has none: 400x600, background FF5039, white "Book Cover" text. */
export const PLACEHOLDER_COVER_URL = "https://placehold.co/400x600/FF5039/FFF?text=Book+Cover";

/** The app's name: in the header the second word is highlighted in lichen yellow. */
export const BRAND = { firstWord: "Book", secondWord: "Search" } as const;
export const APP_NAME = `${BRAND.firstWord} ${BRAND.secondWord}`;
