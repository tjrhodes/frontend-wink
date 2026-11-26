/**
 * The animation between screens, played by the router.
 *
 * Leaving: the screen lifts away and fades, while a lichen-yellow line starts
 * to grow under the header (like the lines under the menu on tomrhodes.it).
 * Entering: the new screen rises into place and the line finishes and fades.
 */
import { gsap } from "gsap";
import { duration } from "./motion";

/** The element that holds the current screen, and the progress line under the header. */
const SCREEN = "#screen";
const PROGRESS_LINE = "#route-progress";

export const pageTransition = {
  /** Plays the exit; the promise resolves when the old screen is out of sight. */
  leave() {
    const timeline = gsap.timeline({ defaults: { duration: duration(0.22), ease: "power2.in" } });
    timeline.to(SCREEN, { autoAlpha: 0, y: -12 });
    timeline.fromTo(PROGRESS_LINE, { scaleX: 0, autoAlpha: 1 }, { scaleX: 0.7, ease: "power1.out" }, 0);
    return finished(timeline);
  },

  /** Plays the entrance of the screen that has just been drawn. */
  enter() {
    const timeline = gsap.timeline({ defaults: { duration: duration(0.4), ease: "power3.out" } });
    timeline.fromTo(SCREEN, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, clearProps: "transform" });
    timeline.to(PROGRESS_LINE, { scaleX: 1, duration: duration(0.2) }, 0);
    timeline.to(PROGRESS_LINE, { autoAlpha: 0, duration: duration(0.3) });
    return finished(timeline);
  },
};

/** Turns a GSAP timeline into a plain promise the router can await. */
function finished(timeline: gsap.core.Timeline): Promise<void> {
  return new Promise((resolve) => timeline.eventCallback("onComplete", () => resolve()));
}
