/**
 * The rock-navy band at the top of every screen.
 *
 * Each screen draws its own band, marked with `data-band`. During a page
 * transition a "backdrop" with the same background sits behind the screen,
 * so the band seems to stay put and simply change height while the content
 * around it fades out and in (see transitions/pageTransition.ts).
 */

/** The band's background: one definition, so the screens and the backdrop always match. */
export const BAND_BACKGROUND = "bg-linear-to-br from-crevice via-rock to-rock-2 text-paper";
