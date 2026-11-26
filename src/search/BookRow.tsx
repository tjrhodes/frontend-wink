/**
 * One book in the results list. The whole row is a link to the book's page,
 * and the description is cut to two lines with "…", as the brief asks.
 *
 * Every row is exactly the same height (`h-row`, set in app.css): one line of
 * title, one of authors, two of description, whatever the book. So as results
 * change while you type, nothing below them moves.
 */
import { authorList, publicationYear, type Book } from "../books/book";
import { BookCover } from "../books/BookCover";
import { Link } from "../routing/Link";

/** The row's layout, shared with the loading placeholder so both are exactly the same shape. */
export const ROW_LAYOUT = "flex h-row items-start gap-4 overflow-hidden px-3 py-4 sm:gap-6 sm:px-4";
export const ROW_COVER = "w-20 shrink-0";

export function BookRow({ book }: { book: Book }) {
  const byline = [authorList(book), publicationYear(book)].filter(Boolean).join(" · ");
  return (
    <li>
      <Link
        to={{ name: "book", bookId: book.id }}
        className={`group ${ROW_LAYOUT} border-l-2 border-transparent transition-colors hover:border-lichen hover:bg-lichen-wash`}
      >
        <BookCover book={book} className={ROW_COVER} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl text-rock group-hover:text-slate sm:text-2xl">{book.title}</h2>
          {/* A non-breaking space keeps the line's height even when Google has no authors or date. */}
          <p className="kicker mt-1 truncate text-xs text-ember">{byline || " "}</p>
          <p className="mt-2 line-clamp-2 text-mute">{book.summary || "No description available."}</p>
        </div>
      </Link>
    </li>
  );
}
