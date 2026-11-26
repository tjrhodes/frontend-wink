/**
 * "Back to results". When you came from the results, it goes Back, so you
 * land on the same page, at the same scroll position. When you arrived
 * straight from a shared link, it's a plain link to the search screen.
 */
import type { MouseEvent } from "react";
import { Link } from "./Link";
import { goBackIfPossible } from "./navigation";
import { emptySearchRoute } from "./routes";

export function BackToResults({ className = "" }: { className?: string }) {
  return (
    <Link
      to={emptySearchRoute()}
      onClick={goBackInstead}
      className={`kicker inline-block py-2 hover:text-rust ${className}`}
    >
      ← Back to results
    </Link>
  );
}

/** If going Back is possible, do that instead of following the link. */
function goBackInstead(event: MouseEvent<HTMLAnchorElement>) {
  const opensElsewhere = event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0;
  if (!opensElsewhere && goBackIfPossible()) event.preventDefault();
}
