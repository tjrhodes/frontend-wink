/**
 * One book in the results list. The whole row is a link to the book's page,
 * and the description is cut to two lines with "…", as the brief asks.
 */
import { authorList, publicationYear, type Book } from "../books/book";
import { BookCover } from "../books/BookCover";
import { Link } from "../routing/Link";

export function BookRow({ book }: { book: Book }) {
  const byline = [authorList(book), publicationYear(book)].filter(Boolean).join(" · ");
  return (
    <li>
      <Link
        to={{ name: "book", bookId: book.id }}
        className="group flex gap-4 border-l-2 border-transparent px-3 py-4 transition-colors hover:border-lichen hover:bg-lichen-wash sm:gap-6 sm:px-4"
      >
        <BookCover book={book} className="w-16 shrink-0 self-start sm:w-20" />
        <div className="min-w-0">
          <h2 className="text-xl text-rock group-hover:text-slate sm:text-2xl">{book.title}</h2>
          {byline && <p className="kicker mt-1 text-xs text-ember">{byline}</p>}
          <p className="mt-2 line-clamp-2 text-mute">{book.summary || "No description available."}</p>
        </div>
      </Link>
    </li>
  );
}
