/**
 * The animation between screens, played by the router.
 *
 * The blue band at the top stays on screen the whole time:
 * 1. Leaving: a book title drops away letter by letter, then the content
 *    fades out (hard ease-in). A backdrop the same height and colour as the
 *    band sits behind it, so the band seems to stay.
 * 2. Entering: the band moves into place, by morphing or sliding depending
 *    on the scroll position (see bandTransition.ts), then the new content
 *    fades in on top (hard ease-out) while a book title builds in (see titleBuild.ts).
 * Meanwhile a lichen-yellow line grows under the header, like the lines under
 * the menu on tomrhodes.it.
 */
import { gsap } from "gsap";
import { BAND_MOTION, holdBand, moveBand, releaseBand } from "./bandTransition";
import { duration } from "./motion";
import { titleBuildIn, titleBuildOut } from "./titleBuild";

const SCREEN = "#screen";
const PROGRESS_LINE = "#route-progress";

export const pageTransition = {
  /** The title drops away (on a book page), then the content fades out with a hard ease-in. */
  leave() {
    holdBand();
    const timeline = gsap.timeline();
    const titleOut = titleBuildOut();
    if (titleOut) timeline.add(titleOut);
    // With a title, the fade starts as its last letters are leaving.
    timeline.to(SCREEN, { autoAlpha: 0, duration: duration(0.3), ease: "power4.in" }, titleOut ? ">-0.15" : 0);
    timeline.fromTo(PROGRESS_LINE, { scaleX: 0, autoAlpha: 1 }, { scaleX: 0.6, duration: duration(0.3) }, 0);
    return finished(timeline);
  },

  /** Moves the band and the page into place (see bandTransition.ts), then fades the new content in. */
  enter(targetScroll: number) {
    const timeline = gsap.timeline();
    timeline.add(moveBand(targetScroll));
    timeline.to(PROGRESS_LINE, { scaleX: 1, duration: duration(BAND_MOTION.duration), ease: BAND_MOTION.ease }, 0);
    revealContent(timeline);
    timeline.to(PROGRESS_LINE, { autoAlpha: 0, duration: duration(0.3) }, "<");
    // From here the screen's own band takes over, so the backdrop can't stick
    // out from under it if the window is resized later.
    timeline.call(releaseBand);
    return finished(timeline);
  },
};

/**
 * The very first screen just fades in, band and all: there's no previous band
 * to morph from, and the search field is ready to type into sooner.
 */
export function playFirstAppearance() {
  return finished(revealContent(gsap.timeline()));
}

/** Adds the content's entrance to a timeline: a fade with a hard ease-out, and the title building in. */
function revealContent(timeline: gsap.core.Timeline): gsap.core.Timeline {
  const titleIn = titleBuildIn();
  timeline.fromTo(SCREEN, { autoAlpha: 0 }, { autoAlpha: 1, duration: duration(0.45), ease: "power4.out" });
  if (titleIn) timeline.add(titleIn, "<0.05");
  return timeline;
}

/** Turns a GSAP timeline into a plain promise the router can await. */
function finished(timeline: gsap.core.Timeline): Promise<void> {
  return new Promise((resolve) => timeline.eventCallback("onComplete", () => resolve()));
}
