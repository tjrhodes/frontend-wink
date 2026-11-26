/**
 * The line above the results: how many there are, which page this is,
 * and how many books to show per page (the brief's 5, 10, 15 or 20).
 */
import { PAGE_SIZES, type PageSize } from "../config";
import { goTo } from "../routing/navigation";
import type { SearchRoute } from "../routing/routes";

const formatNumber = new Intl.NumberFormat("en").format;

type ResultsToolbarProps = { route: SearchRoute; totalItems: number; totalPages: number };

export function ResultsToolbar({ route, totalItems, totalPages }: ResultsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-rock pb-3">
      {/* "About", because Google's total is an estimate that can change from page to page. */}
      <p className="kicker text-mute">
        About {formatNumber(totalItems)} books · page {route.page} of {formatNumber(totalPages)}
      </p>
      <PageSizePicker route={route} />
    </div>
  );
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
