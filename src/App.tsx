/**
 * The frame around every screen: header, the current screen, footer.
 * Which screen is shown comes from the route, which comes from the address.
 */
import { useCurrentRoute } from "./app/hooks";
import { BookScreen } from "./book/BookScreen";
import { BRAND } from "./config";
import { Link } from "./routing/Link";
import { emptySearchRoute, screenOf, type Route } from "./routing/routes";
import { SearchScreen } from "./search/SearchScreen";
import { StatusMessage } from "./ui/StatusMessage";

export function App() {
  const route = useCurrentRoute();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      {/* Starts hidden: the router's GSAP entrance reveals it. `key` gives each screen a fresh start. */}
      <main id="screen" key={screenOf(route)} className="invisible flex-1">
        <ScreenFor route={route} />
      </main>
      <SiteFooter />
    </div>
  );
}

function ScreenFor({ route }: { route: Route }) {
  if (route.name === "search") return <SearchScreen route={route} />;
  if (route.name === "book") return <BookScreen bookId={route.bookId} />;
  return <NotFoundScreen />;
}

/** Rock navy, with the name in condensed capitals and a lichen accent, as on tomrhodes.it. */
function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 bg-rock text-paper">
      <div className="mx-auto flex min-h-16 max-w-5xl items-center px-5 sm:px-10">
        <Link to={emptySearchRoute()} className="font-cond text-2xl tracking-[0.06em] uppercase">
          {BRAND.firstWord} <b className="font-semibold text-lichen">{BRAND.secondWord}</b>
        </Link>
      </div>
      {/* The lichen line the page transition draws while screens change. */}
      <div id="route-progress" className="invisible absolute inset-x-0 bottom-0 h-0.5 origin-left bg-lichen" />
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-crevice text-sm text-mist-dim">
      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-10">
        Built by{" "}
        <a href="https://tomrhodes.it" className="text-lichen hover:text-sun">
          Tom Rhodes
        </a>{" "}
        · Book data from Google Books
      </div>
    </footer>
  );
}

function NotFoundScreen() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-10">
      <StatusMessage title="There's nothing at this address">
        <Link to={emptySearchRoute()} className="text-slate underline hover:text-rust">
          Search for a book
        </Link>
      </StatusMessage>
    </div>
  );
}
