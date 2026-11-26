/**
 * Grey placeholder rows, the same shape as real results, shown while the
 * first answer is on its way. The page doesn't jump when the books arrive.
 */
export function SkeletonList({ rows }: { rows: number }) {
  return (
    <ol aria-label="Loading results" aria-busy className="mt-12 animate-pulse divide-y divide-line">
      {Array.from({ length: rows }, (_, position) => (
        <li key={position} className="flex gap-4 px-3 py-4 sm:gap-6 sm:px-4">
          <div className="aspect-[2/3] w-16 shrink-0 rounded-card bg-stone/60 sm:w-20" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-5 w-2/3 rounded bg-stone/60" />
            <div className="h-3 w-1/3 rounded bg-stone/40" />
            <div className="h-3 w-full rounded bg-mist" />
          </div>
        </li>
      ))}
    </ol>
  );
}
