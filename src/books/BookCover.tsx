/**
 * A book cover in the usual 2:3 shape.
 * If Google's image fails to load, it falls back to the brief's placeholder.
 */
import type { SyntheticEvent } from "react";
import { PLACEHOLDER_COVER_URL } from "../config";
import type { Book } from "./book";

type BookCoverProps = { book: Book; className?: string; describe?: boolean };

/** `describe` gives the image a text alternative; leave it off where the title is right next to it. */
export function BookCover({ book, className = "", describe = false }: BookCoverProps) {
  return (
    <img
      src={book.coverUrl}
      alt={describe ? `Cover of ${book.title}` : ""}
      loading="lazy"
      width={400}
      height={600}
      onError={showPlaceholderInstead}
      className={`aspect-[2/3] rounded-card bg-stone object-cover shadow-md shadow-rock/15 ${className}`}
    />
  );
}

/** Swaps a broken cover for the placeholder (only once, so a broken placeholder can't loop). */
function showPlaceholderInstead(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (image.src !== PLACEHOLDER_COVER_URL) image.src = PLACEHOLDER_COVER_URL;
}
