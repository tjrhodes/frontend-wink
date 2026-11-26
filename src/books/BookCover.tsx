/**
 * A book cover in the usual 2:3 shape.
 *
 * Until the image has loaded, the box shows a soft pulse and a tiny lichen
 * spinner; then the image fades in. The box has its final size from the start,
 * so nothing moves when the image arrives. If Google's image fails to load,
 * the brief's placeholder is used instead.
 */
import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { PLACEHOLDER_COVER_URL } from "../config";
import type { Book } from "./book";

type BookCoverProps = {
  book: Book;
  className?: string;
  /** Gives the image a text alternative; leave it off where the title is right next to it. */
  describe?: boolean;
  /** The cover sits on the dark blue band, so its loading box should be dark too. */
  onDark?: boolean;
};

export function BookCover({ book, className = "", describe = false, onDark = false }: BookCoverProps) {
  const { imageRef, hasLoaded, markLoaded } = useImageLoaded();
  return (
    <div className={`relative aspect-[2/3] overflow-hidden rounded-card shadow-md shadow-rock/15 ${className}`}>
      {!hasLoaded && <CoverPreloader onDark={onDark} />}
      <img
        ref={imageRef}
        src={book.coverUrl}
        alt={describe ? `Cover of ${book.title}` : ""}
        loading="lazy"
        width={400}
        height={600}
        onLoad={markLoaded}
        onError={(event) => showPlaceholderInstead(event, markLoaded)}
        className={`size-full object-cover transition-opacity duration-500 ease-out motion-reduce:transition-none ${hasLoaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

/**
 * Tracks whether an image has loaded. An image the browser already has (for
 * example one preloaded during the page transition) can finish before React
 * starts listening for "load", so it's also checked once on arrival.
 */
function useImageLoaded() {
  const imageRef = useRef<HTMLImageElement>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const markLoaded = () => setHasLoaded(true);
  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) setHasLoaded(true);
  }, []);
  return { imageRef, hasLoaded, markLoaded };
}

/** The tiny preloader: a gently pulsing box with a small spinning lichen ring. */
function CoverPreloader({ onDark }: { onDark: boolean }) {
  return (
    <div
      className={`absolute inset-0 grid animate-pulse place-items-center ${onDark ? "bg-rock-lift" : "bg-stone/60"}`}
    >
      <span className="size-4 animate-spin rounded-full border-2 border-lichen/30 border-t-lichen motion-reduce:animate-none" />
    </div>
  );
}

/**
 * Swaps a broken cover for the placeholder. If the placeholder fails too,
 * the preloader is stopped anyway, so it can't spin forever.
 */
function showPlaceholderInstead(event: SyntheticEvent<HTMLImageElement>, giveUp: () => void) {
  const image = event.currentTarget;
  if (image.src !== PLACEHOLDER_COVER_URL) image.src = PLACEHOLDER_COVER_URL;
  else giveUp();
}
