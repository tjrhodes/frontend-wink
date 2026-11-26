/**
 * The book itself: a rock-navy band with the cover and title (like the hero
 * on tomrhodes.it), then the facts, the description and the link to Google Books.
 */
import DOMPurify from "dompurify";
import type { ReactNode } from "react";
import { authorList, type Book } from "../books/book";
import { BookCover } from "../books/BookCover";
import { BackToResults } from "../routing/BackToResults";
import { BookFacts } from "./BookFacts";

/** The only HTML we let through from Google's descriptions: simple text formatting. */
const ALLOWED_DESCRIPTION_TAGS = ["p", "br", "b", "strong", "i", "em", "u", "ul", "ol", "li"];

export function BookDetails({ book }: { book: Book }) {
  return (
    <article>
      <BookHeader book={book} />
      <div className="mx-auto grid max-w-5xl gap-10 px-5 py-10 sm:px-10 md:grid-cols-[1fr_16rem]">
        <Description book={book} />
        <aside className="space-y-6">
          <BookFacts book={book} />
          {book.infoLink && <GoogleBooksButton href={book.infoLink} />}
        </aside>
      </div>
    </article>
  );
}

function BookHeader({ book }: { book: Book }) {
  return (
    <BookHeaderFrame cover={<BookCover book={book} describe className={HEADER_COVER} />}>
      <h1 tabIndex={-1} className="text-4xl outline-none sm:text-5xl">
        {book.title}
      </h1>
      {book.subtitle && <p className="mt-2 text-xl text-mist-dim">{book.subtitle}</p>}
      {book.authors.length > 0 && <p className="kicker mt-4 text-lichen">{authorList(book)}</p>}
    </BookHeaderFrame>
  );
}

/** The cover size in the header, shared with the loading placeholder. */
export const HEADER_COVER = "w-40 shrink-0 sm:w-48";

/**
 * The rock-navy band at the top of a book page. The loading placeholder uses
 * the same frame, so the page doesn't jump when the book arrives.
 */
export function BookHeaderFrame({ cover, children }: { cover: ReactNode; children: ReactNode }) {
  return (
    <header className="bg-linear-to-br from-crevice via-rock to-rock-2 text-paper">
      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-10 sm:py-10">
        <BackToResults className="mb-6 text-lichen" />
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end">
          {cover}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </header>
  );
}

/** Google's description can contain HTML, so it is sanitised before it's shown. */
function Description({ book }: { book: Book }) {
  if (!book.descriptionHtml) return <p className="text-mute">Google Books has no description for this book.</p>;
  const safeHtml = DOMPurify.sanitize(book.descriptionHtml, {
    ALLOWED_TAGS: ALLOWED_DESCRIPTION_TAGS,
    ALLOWED_ATTR: [],
  });
  return (
    <div
      className="max-w-prose space-y-4 text-lg [&_li]:ml-6 [&_ol]:list-decimal [&_ul]:list-disc"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}

/** The brief's infoLink, styled like the buttons on tomrhodes.it. */
function GoogleBooksButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-card border-2 text-center border-lichen bg-lichen px-5 py-3 font-cond font-semibold tracking-[0.12em] text-rock uppercase transition hover:-translate-y-0.5 hover:bg-transparent"
    >
      View on Google Books ↗
    </a>
  );
}
