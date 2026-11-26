/**
 * The line above the results: how many there are, which page this is,
 * and how many books to show per page (the brief's 5, 10, 15 or 20).
 * It's shown while loading too ("Searching…"), so the list below never moves.
 */
import { PAGE_SIZES, type PageSize } from "../config";
import { goTo } from "../routing/navigation";
import type { SearchRoute } from "../routing/routes";

const formatNumber = new Intl.NumberFormat("en").format;

/** Google's estimate of how many books match; left out while the first answer is still loading. */
export function ResultsToolbar({ route, estimatedTotal }: { route: SearchRoute; estimatedTotal?: number }) {
  return (
    // Stacked on phones and side by side from tablets up, whatever the text, so its height never changes.
    <div className="flex flex-col gap-2 border-b-2 border-rock pb-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="kicker truncate text-mute">
        {estimatedTotal === undefined ? "Searching…" : describeTotal(route, estimatedTotal)}
      </p>
      <PageSizePicker route={route} />
    </div>
  );
}

/** "About", because Google's count is only an estimate (and no "of N": see usePagingFacts.ts). */
function describeTotal(route: SearchRoute, estimatedTotal: number): string {
  return `About ${formatNumber(estimatedTotal)} books · page ${route.page}`;
}

/** Changing the page size goes back to page 1, since the old page number no longer means the same books. */
function PageSizePicker({ route }: { route: SearchRoute }) {
  return (
    <label className="kicker flex items-center gap-2 text-mute">
      Per page
      <select
        value={route.pageSize}
        onChange={(event) => goTo({ ...route, pageSize: Number(event.target.value) as PageSize, page: 1 })}
        className="rounded-card border border-line bg-paper px-2 py-1 font-sans text-base tracking-normal text-ink"
      >
        {PAGE_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </label>
  );
}
