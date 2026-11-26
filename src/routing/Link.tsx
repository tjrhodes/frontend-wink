/**
 * A normal <a href> link to one of the app's routes.
 *
 * It needs no click handler: the Navigation API sees the click and the router
 * takes it from there. So right-click, "open in new tab" and copying the link
 * all behave exactly as on any website.
 */
import type { AnchorHTMLAttributes } from "react";
import { urlForRoute, type Route } from "./routes";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: Route };

export function Link({ to, ...anchorProps }: LinkProps) {
  return <a href={urlForRoute(to)} {...anchorProps} />;
}
