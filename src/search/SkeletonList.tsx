/**
 * Grey placeholder rows, built with the same layout as real results,
 * shown while the first answer is on its way. When the books arrive they
 * take exactly the same space, so nothing jumps.
 */
import { ROW_COVER, ROW_LAYOUT } from "./BookRow";

export function SkeletonList({ rows }: { rows: number }) {
  return (
    <ol aria-label="Loading results" aria-busy className="animate-pulse divide-y divide-line">
      {Array.from({ length: rows }, (_, position) => (
        <li key={position} className={`${ROW_LAYOUT} border-l-2 border-transparent`}>
          <div className={`${ROW_COVER} aspect-[2/3] rounded-card bg-stone/60`} />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-5 w-2/3 rounded bg-stone/60" />
            <div className="h-3 w-1/3 rounded bg-stone/40" />
            <div className="h-3 w-full rounded bg-mist" />
            <div className="h-3 w-5/6 rounded bg-mist" />
          </div>
        </li>
      ))}
    </ol>
  );
}
