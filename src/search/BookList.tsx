/**
 * The list of results. Each new set of results arrives with a quick
 * staggered GSAP entrance, one row after another.
 */
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef } from "react";
import type { Book } from "../books/book";
import { duration } from "../transitions/motion";
import { BookRow } from "./BookRow";

gsap.registerPlugin(useGSAP);

export function BookList({ books }: { books: Book[] }) {
  const listRef = useRef<HTMLOListElement>(null);

  // Runs again only when a different set of results arrives (cached ones keep their identity).
  useGSAP(
    () => {
      // fromTo, not from: if new results arrive mid-animation, `from` would take the
      // half-faded rows as its end point and leave them stuck half-faded.
      gsap.fromTo(
        "li",
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, stagger: 0.03, duration: duration(0.3), ease: "power2.out", clearProps: "transform" },
      );
    },
    { scope: listRef, dependencies: [books] },
  );

  return (
    <ol ref={listRef} className="divide-y divide-line">
      {books.map((book, position) => (
        // Google occasionally repeats a book in one page, so the position keeps keys unique.
        <BookRow key={`${position}-${book.id}`} book={book} />
      ))}
    </ol>
  );
}
