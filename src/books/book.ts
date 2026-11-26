/**
 * What a book is inside this app, and the one place that translates
 * Google's answer into it.
 *
 * Google's data is deep, mostly optional and inconsistent (http cover links,
 * HTML in some descriptions, missing fields). All of that is handled here,
 * so the rest of the app works with simple, complete objects.
 */
import { PLACEHOLDER_COVER_URL } from "../config";

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  authors: string[];
  /** The description as plain text, for the two-line summary in the list. */
  summary: string;
  /** The description as Google sends it, which may contain simple HTML. Sanitise before showing. */
  descriptionHtml: string;
  coverUrl: string;
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  categories: string[];
  language?: string;
  /** The book's page on Google Books, which the brief asks the detail page to link to. */
  infoLink?: string;
}

export interface BookSearchResult {
  books: Book[];
  /** Google's estimate of how many books match. It can change from page to page. */
  totalItems: number;
}

/** The parts of Google's "volume" object that we use. */
export interface GoogleVolume {
  id: string;
  volumeInfo?: {
    title?: string;
    subtitle?: string;
    authors?: string[];
    description?: string;
    publisher?: string;
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    language?: string;
    infoLink?: string;
    imageLinks?: CoverLinks;
  };
}

export interface GoogleVolumeList {
  totalItems?: number;
  items?: GoogleVolume[];
}

type CoverSize = "smallThumbnail" | "thumbnail" | "small" | "medium" | "large" | "extraLarge";
type CoverLinks = Partial<Record<CoverSize, string>>;

/** Cover sizes from best to worst for the detail page. Lists only ever get thumbnails from Google. */
const COVER_SIZES_BEST_FIRST: CoverSize[] = ["large", "medium", "small", "thumbnail", "smallThumbnail"];

/** Turns Google's list answer into ours. A search with no matches has no `items` at all. */
export function toBookSearchResult(response: GoogleVolumeList): BookSearchResult {
  return {
    books: (response.items ?? []).map(toBook),
    totalItems: response.totalItems ?? 0,
  };
}

/** Turns one Google volume into a Book, filling every gap with a sensible value. */
export function toBook({ id, volumeInfo: info = {} }: GoogleVolume): Book {
  return {
    id,
    title: info.title ?? "Untitled",
    subtitle: info.subtitle,
    authors: info.authors ?? [],
    summary: plainText(info.description ?? ""),
    descriptionHtml: info.description ?? "",
    coverUrl: bestCoverUrl(info.imageLinks),
    publisher: info.publisher,
    publishedDate: info.publishedDate,
    pageCount: info.pageCount || undefined,
    categories: info.categories ?? [],
    language: info.language,
    infoLink: info.infoLink,
  };
}

/** The biggest cover Google has, over https, or the brief's placeholder when there's none. */
function bestCoverUrl(imageLinks: CoverLinks | undefined): string {
  const coverUrl = COVER_SIZES_BEST_FIRST.map((size) => imageLinks?.[size]).find(Boolean);
  // Google still sends http:// links, which browsers block on an https page.
  return coverUrl ? coverUrl.replace(/^http:\/\//, "https://") : PLACEHOLDER_COVER_URL;
}

/** Strips any HTML tags, so "<p>A <b>great</b> book</p>" becomes "A great book". */
function plainText(html: string): string {
  return new DOMParser().parseFromString(html, "text/html").body.textContent?.trim() ?? "";
}

/** "Ursula K. Le Guin, Brian Attebery", or nothing when Google doesn't say. */
export function authorList(book: Book): string {
  return book.authors.join(", ");
}

/** Just the year from Google's date, which may be "2004", "2004-05" or "2004-05-12". */
export function publicationYear(book: Book): string | undefined {
  return book.publishedDate?.slice(0, 4);
}
