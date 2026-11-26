/**
 * The book title, built letter by letter with GSAP's SplitText.
 *
 * Each word gets a mask (a window with hidden overflow), and its letters rise
 * into it one after another. Leaving the page plays the mirror image: the
 * letters drop back out of sight, last letter first.
 *
 * The title is split only while it animates, then put back to plain text,
 * so React keeps full control of it the rest of the time. SplitText also
 * gives the heading an aria-label, so screen readers hear the whole title
 * rather than single letters.
 */
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { duration } from "./motion";

gsap.registerPlugin(SplitText);

/** The heading to build, marked by the screen that has one (only the book page, for now). */
const SPLIT_TITLE = "#screen [data-split-title]";

/** Letters start (and end) just below their word's mask. */
const OUT_OF_SIGHT = { yPercent: 110 };

/** Builds the title in. Returns nothing when the screen has no title to build. */
export function titleBuildIn(): gsap.core.Timeline | undefined {
  const split = splitTitle();
  if (!split) return undefined;
  const timeline = gsap.timeline({ onComplete: () => split.revert() });
  // `from` hides the letters straight away, before the screen has faded in.
  timeline.from(split.chars, {
    ...OUT_OF_SIGHT,
    stagger: { amount: 0.4 },
    duration: duration(0.6),
    ease: "power4.out",
  });
  return timeline;
}

/** The mirror of titleBuildIn: the letters drop away, last one first. */
export function titleBuildOut(): gsap.core.Timeline | undefined {
  const split = splitTitle();
  if (!split) return undefined;
  const timeline = gsap.timeline();
  timeline.to(split.chars, {
    ...OUT_OF_SIGHT,
    stagger: { amount: 0.25, from: "end" },
    duration: duration(0.4),
    ease: "power4.in",
  });
  return timeline;
}

/** Splits the screen's title into masked words and letters, if it has one. */
function splitTitle(): SplitText | undefined {
  const title = document.querySelector(SPLIT_TITLE);
  return title ? SplitText.create(title, { type: "words,chars", mask: "words" }) : undefined;
}
