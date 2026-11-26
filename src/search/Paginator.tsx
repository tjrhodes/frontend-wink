/**
 * Previous / page numbers / next. Every page is a real link, so pages can be
 * opened in new tabs, and Back returns to the page you came from.
 */
import { Link } from "../routing/Link";
import type { SearchRoute } from "../routing/routes";
import { pageNumbersAround } from "./pageNumbers";

const BUTTON =
  "inline-flex min-w-10 items-center justify-center gap-1 rounded-card px-3 py-2 font-cond font-medium tracking-wide";
const ACTIVE_LINK = "text-slate hover:bg-mist hover:text-rust";

/** The two step buttons: which way they go, and what they say. */
const STEPS = {
  previous: { pageOffset: -1, label: "Previous", arrow: "←" },
  next: { pageOffset: 1, label: "Next", arrow: "→" },
} as const;

export function Paginator({ route, totalPages }: { route: SearchRoute; totalPages: number }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pages of results" className="mt-8 flex items-center justify-center gap-1">
      <StepLink route={route} totalPages={totalPages} direction="previous" />
      {pageNumbersAround(route.page, totalPages).map((item, position) =>
        item === "gap" ? (
          <span key={`gap-${position}`} className="px-1 text-mute" aria-hidden>
            …
          </span>
        ) : (
          <PageLink key={item} route={route} page={item} />
        ),
      )}
      <StepLink route={route} totalPages={totalPages} direction="next" />
    </nav>
  );
}

/** A numbered page; the current one is highlighted in lichen yellow. */
function PageLink({ route, page }: { route: SearchRoute; page: number }) {
  const isCurrent = page === route.page;
  const look = isCurrent ? "bg-lichen text-rock" : ACTIVE_LINK;
  return (
    <Link to={{ ...route, page }} aria-current={isCurrent ? "page" : undefined} className={`${BUTTON} ${look}`}>
      {page}
    </Link>
  );
}

type StepLinkProps = { route: SearchRoute; totalPages: number; direction: keyof typeof STEPS };

/**
 * "Previous" or "Next", greyed out (not a link) when there's nowhere to go.
 * On phones only the arrow shows; the word stays there for screen readers.
 */
function StepLink({ route, totalPages, direction }: StepLinkProps) {
  const { pageOffset, label, arrow } = STEPS[direction];
  const toPage = route.page + pageOffset;
  const word = <span className="max-sm:sr-only">{label}</span>;
  const content =
    direction === "previous" ? (
      <>
        {arrow}
        {word}
      </>
    ) : (
      <>
        {word}
        {arrow}
      </>
    );
  if (toPage < 1 || toPage > totalPages) return <span className={`${BUTTON} text-line`}>{content}</span>;
  return (
    <Link to={{ ...route, page: toPage }} className={`${BUTTON} ${ACTIVE_LINK}`}>
      {content}
    </Link>
  );
}
