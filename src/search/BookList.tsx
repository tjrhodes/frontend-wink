/**
 * The list of results. Each new set of results fades up with a quick
 * GSAP stagger, one row after another.
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

  // A soft refresh each time a different set of results arrives (cached ones keep
  // their identity, so they don't replay). Opacity only: nothing moves, nothing jumps.
  // fromTo, not from: if new results arrive mid-animation, `from` would take the
  // half-faded rows as its end point and leave them stuck half-faded.
  useGSAP(
    () => {
      gsap.fromTo(
        "li",
        { autoAlpha: 0.3 },
        { autoAlpha: 1, stagger: 0.02, duration: duration(0.25), ease: "power1.out" },
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
