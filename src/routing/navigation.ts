/**
 * The router, built on the browser's Navigation API.
 *
 * The browser fires one `navigate` event for every way of moving around:
 * clicking a link, the back and forward buttons, or our own `goTo()`.
 * We catch each one, keep the page from reloading, and show the new route
 * instead, with a GSAP transition when the screen changes.
 *
 * Because links are real <a href> links and addresses are real URLs,
 * the back button, refresh, bookmarks and shared links all just work.
 */
import { flushSync } from "react-dom";
import type { AppStore } from "../app/store";
import { pageTransition, playFirstAppearance } from "../transitions/pageTransition";
import { prepareRoute } from "./prepareRoute";
import { routeChanged, selectCurrentRoute } from "./routeSlice";
import { routeFromUrl, screenOf, urlForRoute, type Route } from "./routes";

/** The store the router writes the current route into, set once by startRouter. */
let routerStore: AppStore | undefined;

/** Shows the route for the current address, then follows every navigation from now on. */
export function startRouter(store: AppStore) {
  routerStore = store;
  showRoute(routeFromUrl(new URL(location.href)));
  if (hasNavigationApi()) navigation.addEventListener("navigate", interceptNavigation);
  else addEventListener("popstate", showAddressWithoutNavigationApi);
}

/**
 * Moves the app to a route. `replace` swaps the current history entry instead
 * of adding one: used while typing, so Back doesn't undo one letter at a time.
 */
export function goTo(route: Route, { replace = false } = {}) {
  const url = urlForRoute(route);
  if (hasNavigationApi()) navigation.navigate(url, { history: replace ? "replace" : "push" });
  else goToWithHistoryApi(url, replace);
}

/**
 * Goes back one step if the previous page was in this app (so the results,
 * scroll position and all come back as they were). Returns false when there's
 * no previous page in the app, so a link can follow its own href instead.
 */
export function goBackIfPossible(): boolean {
  if (!hasNavigationApi() || !navigation.canGoBack) return false;
  void navigation.back();
  return true;
}

/** Every browser has had the Navigation API since January 2026; older ones fall back. */
function hasNavigationApi(): boolean {
  return "navigation" in window;
}

/** Takes over navigations inside the app; anything else (downloads, forms, #anchors) is left alone. */
function interceptNavigation(event: NavigateEvent) {
  const isOurs = event.canIntercept && !event.hashChange && !event.downloadRequest && !event.formData;
  if (!isOurs) return;
  const nextRoute = routeFromUrl(new URL(event.destination.url));
  rememberScrollPosition();
  // "manual" scrolling and focus: we decide when and how the page scrolls (as
  // part of the transition), and where focus goes (the browser's default would
  // pull it out of the search field after every letter).
  event.intercept({ scroll: "manual", focusReset: "manual", handler: () => changeRoute(event, nextRoute) });
}

/** Shows the next route: instantly on the same screen, with a transition on a new one. */
async function changeRoute(event: NavigateEvent, nextRoute: Route) {
  const isNewScreen = screenOf(nextRoute) !== screenOf(currentRoute());
  if (!isNewScreen) return showOnSameScreen(event, nextRoute);
  // The old screen fades out while the new screen's data loads.
  const [releaseData] = await Promise.all([prepareRoute(nextRoute, store()), pageTransition.leave()]);
  // If a newer navigation started while we were animating, it takes over from here.
  if (event.signal.aborted) return releaseData();
  showRoute(nextRoute);
  releaseData();
  await revealScreen({ targetScroll: scrollTargetFor(event) });
}

/**
 * Typing replaces the history entry and keeps the scroll position; a new page
 * of results goes to the top, and Back or Forward to where you were.
 */
function showOnSameScreen(event: NavigateEvent, nextRoute: Route) {
  showRoute(nextRoute);
  scrollTo(0, scrollTargetFor(event));
}

/**
 * Plays the entrance of a newly drawn screen, then moves keyboard focus into it:
 * to whatever the screen marked with `data-autofocus`, or else its main heading,
 * so keyboard and screen reader users start reading in the right place.
 */
export async function revealScreen({ isFirstScreen = false, targetScroll = scrollY } = {}) {
  await (isFirstScreen ? playFirstAppearance() : pageTransition.enter(targetScroll));
  const startingPoint = document.querySelector<HTMLElement>("#screen [data-autofocus], #screen h1");
  startingPoint?.focus({ preventScroll: true });
}

/**
 * Where each history entry was scrolled to when we left it, by entry key.
 * Knowing where Back will land *before* scrolling there lets the transition
 * choose how to move the band (see bandTransition.ts).
 */
const scrollPositions = new Map<string, number>();

/** Called as a navigation starts, while the current entry is still the one we're leaving. */
function rememberScrollPosition() {
  const leavingKey = navigation.currentEntry?.key;
  if (leavingKey) scrollPositions.set(leavingKey, scrollY);
}

/** Back/Forward return to where you were; typing stays put; anything new starts at the top. */
function scrollTargetFor(event: NavigateEvent): number {
  if (event.navigationType === "traverse") return scrollPositions.get(event.destination.key) ?? 0;
  return event.navigationType === "replace" ? scrollY : 0;
}

/** Puts a route on screen. flushSync makes React draw it before we carry on animating. */
function showRoute(route: Route) {
  flushSync(() => routerStore?.dispatch(routeChanged(route)));
}

function currentRoute(): Route {
  return selectCurrentRoute(store().getState());
}

function store(): AppStore {
  if (!routerStore) throw new Error("startRouter() must run before navigating");
  return routerStore;
}

/** For browsers without the Navigation API: the older History API, without transitions. */
function goToWithHistoryApi(url: string, replace: boolean) {
  if (replace) history.replaceState(null, "", url);
  else history.pushState(null, "", url);
  showAddressWithoutNavigationApi();
}

/** Shows the current address with just the entrance animation, so a new screen never stays hidden. */
function showAddressWithoutNavigationApi() {
  showRoute(routeFromUrl(new URL(location.href)));
  void revealScreen();
}
