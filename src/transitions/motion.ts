/**
 * Shared motion settings for every GSAP animation in the app.
 *
 * People who ask their system for reduced motion get the same changes,
 * but instantly: every duration goes through `duration()`.
 */

/** True when the visitor has asked their system for less motion. */
export function prefersReducedMotion(): boolean {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** A duration in seconds, or 0 for visitors who prefer reduced motion. */
export function duration(seconds: number): number {
  return prefersReducedMotion() ? 0 : seconds;
}
