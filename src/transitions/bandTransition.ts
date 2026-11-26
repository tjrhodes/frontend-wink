/**
 * How the blue band gets from the old screen to the new one, whatever the
 * scroll position: fully on screen, partly scrolled away, or out of sight.
 *
 * A "backdrop" with the band's colour sits behind the screens. While the
 * content is faded out, it stands in for the band, and only ever shows
 * the part of the band that can really be seen:
 *
 * 1. Leaving: we note how much of the old band is showing (all, some or none).
 * 2. Once the old content has faded, in a single frame: the page goes to the
 *    top and the backdrop is set to exactly that visible height. On screen
 *    nothing changes, and it no longer matters if the browser had scrolled
 *    the page by itself (the new screen can be shorter than the old one).
 * 3. The backdrop grows or shrinks, with a heavy ease, to however much of the
 *    new band will show at the new scroll position (zero if none of it).
 * 4. In a single frame again: the page jumps to its new position and the
 *    backdrop is resized so the same part shows. Then the content fades in.
 */
import { gsap } from "gsap";
import { duration } from "./motion";

const SCREEN_BAND = "#screen [data-band]";
const BAND_BACKDROP = "#band-backdrop";

/** The band's movement: long and heavy at both ends. */
export const BAND_MOTION = { duration: 0.7, ease: "power4.inOut" } as const;

/** Less of the band than this showing is treated as none: no point animating a sliver. */
const VISIBLE_ENOUGH_PX = 24;

/** How much of the old band was showing when we started leaving. */
let bandShowingBefore = 0;

/** Before the old content fades: note how much band shows, and put the backdrop behind it. */
export function holdBand() {
  bandShowingBefore = visiblePartOfBand(heightOfBand(), scrollY);
  gsap.set(BAND_BACKDROP, { height: heightOfBand() });
}

/**
 * Steps 2 to 4 above. Step 2 runs straight away, before the browser can
 * draw a frame of the new screen; the returned timeline does the rest.
 */
export function moveBand(targetScroll: number): gsap.core.Timeline {
  scrollTo(0, 0);
  gsap.set(BAND_BACKDROP, { height: bandShowingBefore });
  const bandShowingAfter = visiblePartOfBand(heightOfBand(), targetScroll);
  const timeline = gsap.timeline();
  timeline.to(BAND_BACKDROP, { height: bandShowingAfter, ...bandMotion() });
  timeline.call(() => landAt(targetScroll));
  return timeline;
}

/** After the new content is in: its own band takes over from the backdrop. */
export function releaseBand() {
  gsap.set(BAND_BACKDROP, { height: 0 });
}

/**
 * Jumps to the new scroll position, with the backdrop at the band's full
 * height: at that position, exactly the part we animated to shows.
 */
function landAt(targetScroll: number) {
  gsap.set(BAND_BACKDROP, { height: heightOfBand() });
  scrollTo(0, targetScroll);
}

/**
 * The band starts right under the (sticky) header, so at a given scroll
 * position the part of it you can see is its height minus the scroll.
 */
function visiblePartOfBand(bandHeight: number, scrollPosition: number): number {
  const visiblePart = bandHeight - scrollPosition;
  return visiblePart > VISIBLE_ENOUGH_PX ? visiblePart : 0;
}

/** The band's movement with the visitor's motion preference applied. */
function bandMotion() {
  return { duration: duration(BAND_MOTION.duration), ease: BAND_MOTION.ease };
}

/** How tall the current screen's band is (it's laid out even while invisible). */
function heightOfBand(): number {
  return document.querySelector(SCREEN_BAND)?.getBoundingClientRect().height ?? 0;
}
