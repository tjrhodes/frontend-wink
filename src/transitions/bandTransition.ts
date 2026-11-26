/**
 * How the blue band gets from the old screen to the new one, depending on
 * whether it can be seen before and after the move.
 *
 * A "backdrop" with the band's colour sits behind the screens. While the
 * content is faded out, the backdrop stands in for the band:
 *
 *   seen before → seen after       it morphs to the new height, and the page
 *                                  scrolls smoothly to its new position with it
 *   scrolled away → seen after     the page jumps (nothing is visible yet), then
 *                                  the band slides down from under the header
 *   seen before → scrolled away    the band slides up under the header, then
 *                                  the page jumps to where you were
 *   scrolled away → scrolled away  no band to animate: just the jump
 */
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { duration } from "./motion";

gsap.registerPlugin(ScrollToPlugin);

const SCREEN_BAND = "#screen [data-band]";
const BAND_BACKDROP = "#band-backdrop";

/** The band's movement: long and heavy at both ends. */
export const BAND_MOTION = { duration: 0.7, ease: "power4.inOut" } as const;

/** Less of the band than this showing counts as scrolled away. */
const VISIBLE_ENOUGH_PX = 24;

/** Before the old content fades: the backdrop takes the band's place and size. */
export function holdBand() {
  gsap.set(BAND_BACKDROP, { height: heightOfBand(), yPercent: 0 });
}

/** Moves the band (and the page) to where the new screen needs them. */
export function moveBand(targetScroll: number): gsap.core.Timeline {
  const isSeenNow = isVisible(heightOfBackdrop(), scrollY);
  const willBeSeen = isVisible(heightOfBand(), targetScroll);
  if (isSeenNow && willBeSeen) return morphBand(targetScroll);
  if (willBeSeen) return slideBandIn(targetScroll);
  if (isSeenNow) return slideBandOut(targetScroll);
  return gsap.timeline().call(() => scrollTo(0, targetScroll));
}

/** After the new content is in: its own band takes over from the backdrop. */
export function releaseBand() {
  gsap.set(BAND_BACKDROP, { height: 0, yPercent: 0 });
}

/** The band grows or shrinks to its new height while the page scrolls along with it. */
function morphBand(targetScroll: number) {
  const motion = { duration: duration(BAND_MOTION.duration), ease: BAND_MOTION.ease };
  const timeline = gsap.timeline();
  timeline.to(BAND_BACKDROP, { height: heightOfBand(), ...motion });
  timeline.to(window, { scrollTo: { y: targetScroll, autoKill: false }, ...motion }, 0);
  return timeline;
}

/** Jump to the new position, then bring the band down from under the header. */
function slideBandIn(targetScroll: number) {
  const timeline = gsap.timeline();
  timeline.call(() => scrollTo(0, targetScroll));
  timeline.set(BAND_BACKDROP, { height: heightOfBand(), yPercent: -100 });
  timeline.to(BAND_BACKDROP, { yPercent: 0, duration: duration(BAND_MOTION.duration), ease: BAND_MOTION.ease });
  return timeline;
}

/** Send the band up under the header, then jump to the new position. */
function slideBandOut(targetScroll: number) {
  const timeline = gsap.timeline();
  timeline.to(BAND_BACKDROP, { yPercent: -100, duration: duration(BAND_MOTION.duration), ease: BAND_MOTION.ease });
  timeline.call(() => scrollTo(0, targetScroll));
  timeline.call(releaseBand);
  return timeline;
}

/**
 * The band starts right under the (sticky) header, so at a given scroll
 * position its visible part is its height minus how far the page is scrolled.
 */
function isVisible(bandHeight: number, scrollPosition: number): boolean {
  return bandHeight - scrollPosition > VISIBLE_ENOUGH_PX;
}

/** How tall the current screen's band is (it's laid out even while invisible). */
function heightOfBand(): number {
  return document.querySelector(SCREEN_BAND)?.getBoundingClientRect().height ?? 0;
}

function heightOfBackdrop(): number {
  return document.querySelector(BAND_BACKDROP)?.getBoundingClientRect().height ?? 0;
}
