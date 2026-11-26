/**
 * The animation between screens, played by the router.
 *
 * The blue band at the top stays on screen the whole time:
 * 1. Leaving: the old screen's content fades out. A backdrop the same height
 *    and colour as the band sits behind it, so the band seems to stay.
 * 2. Entering: the backdrop stretches or shrinks to the new screen's band
 *    height (a heavy ease-in-out), then the new content fades in on top.
 * Meanwhile a lichen-yellow line grows under the header, like the lines under
 * the menu on tomrhodes.it.
 */
import { gsap } from "gsap";
import { duration } from "./motion";

const SCREEN = "#screen";
const SCREEN_BAND = "#screen [data-band]";
const BAND_BACKDROP = "#band-backdrop";
const PROGRESS_LINE = "#route-progress";

export const pageTransition = {
  /** Fades the old content out, leaving the band (on its backdrop) where it is. */
  leave() {
    gsap.set(BAND_BACKDROP, { height: heightOfBand() });
    const timeline = gsap.timeline({ defaults: { duration: duration(0.25), ease: "power2.in" } });
    timeline.to(SCREEN, { autoAlpha: 0 });
    timeline.fromTo(PROGRESS_LINE, { scaleX: 0, autoAlpha: 1 }, { scaleX: 0.6, ease: "power1.out" }, 0);
    return finished(timeline);
  },

  /** Morphs the band to the new screen's height, then fades the new content in. */
  enter() {
    const timeline = gsap.timeline();
    timeline.to(BAND_BACKDROP, { height: heightOfBand(), duration: duration(0.7), ease: "power4.inOut" });
    timeline.to(PROGRESS_LINE, { scaleX: 1, duration: duration(0.7), ease: "power4.inOut" }, 0);
    timeline.fromTo(SCREEN, { autoAlpha: 0 }, { autoAlpha: 1, duration: duration(0.35), ease: "power2.out" });
    timeline.to(PROGRESS_LINE, { autoAlpha: 0, duration: duration(0.3) }, "<");
    // From here the screen's own band takes over, so the backdrop can't stick
    // out from under it if the window is resized later.
    timeline.set(BAND_BACKDROP, { height: 0 });
    return finished(timeline);
  },
};

/**
 * The very first screen just fades in, band and all: there's no previous band
 * to morph from, and the search field is ready to type into sooner.
 */
export function playFirstAppearance() {
  const timeline = gsap.timeline();
  timeline.fromTo(SCREEN, { autoAlpha: 0 }, { autoAlpha: 1, duration: duration(0.35), ease: "power2.out" });
  return finished(timeline);
}

/** How tall the current screen's band is (it's laid out even while invisible). */
function heightOfBand(): number {
  return document.querySelector(SCREEN_BAND)?.getBoundingClientRect().height ?? 0;
}

/** Turns a GSAP timeline into a plain promise the router can await. */
function finished(timeline: gsap.core.Timeline): Promise<void> {
  return new Promise((resolve) => timeline.eventCallback("onComplete", () => resolve()));
}
