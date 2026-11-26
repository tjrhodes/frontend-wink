/**
 * The search screen: the search field on a band of rock navy, and the results below.
 */
import { messageForRequestError } from "../books/errorMessages";
import { useLiveBookSearch } from "../books/useLiveBookSearch";
import type { BookSearchResult } from "../books/book";
import { Link } from "../routing/Link";
import type { SearchRoute } from "../routing/routes";
import { ProblemNotice } from "../ui/ProblemNotice";
import { StatusMessage } from "../ui/StatusMessage";
import { useDocumentTitle } from "../ui/useDocumentTitle";
import { BookList } from "./BookList";
import { countPages } from "./pageNumbers";
import { Paginator } from "./Paginator";
import { ResultsToolbar } from "./ResultsToolbar";
import { SearchBox } from "./SearchBox";
import { SkeletonList } from "./SkeletonList";

export function SearchScreen({ route }: { route: SearchRoute }) {
  useDocumentTitle(route.query.trim() || undefined);
  return (
    <>
      <section className="bg-linear-to-br from-crevice via-rock to-rock-2 text-paper">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-10 sm:py-16">
          <SearchBox route={route} />
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-8 sm:px-10">
        <SearchResults route={route} />
      </section>
    </>
  );
}

/** Picks what to show under the search field, depending on how the search is going. */
function SearchResults({ route }: { route: SearchRoute }) {
  const search = useLiveBookSearch(route);
  if (!search.hasQuery) return <StartTyping />;
  const problem = search.isError ? messageForRequestError(search.error) : null;
  return (
    // Room for a full page of rows is kept from the first letter, so the footer doesn't jump either.
    <div style={{ minHeight: `calc(${route.pageSize} * var(--spacing-row) + 8rem)` }}>
      {problem && <ProblemNotice message={problem} />}
      <ResultsContent route={route} result={search.data} isFetching={search.isFetching} hasProblem={!!problem} />
    </div>
  );
}

type ResultsContentProps = { route: SearchRoute; result?: BookSearchResult; isFetching: boolean; hasProblem: boolean };

/**
 * The toolbar is always there, and the list area always has the same shape:
 * placeholders while loading, books once they arrive, a message if there are none.
 */
function ResultsContent({ route, result, isFetching, hasProblem }: ResultsContentProps) {
  if (!result && hasProblem) return <StatusMessage title="No results to show yet" />;
  if (!result)
    return (
      <>
        <ResultsToolbar route={route} />
        <SkeletonList rows={route.pageSize} />
      </>
    );
  const totalPages = countPages(result.totalItems, route.pageSize);
  return (
    // While a newer search is on its way, these results stay where they are, dimmed.
    <div aria-busy={isFetching} className={`transition-opacity ${isFetching ? "opacity-60" : ""}`}>
      <ResultsToolbar route={route} totals={{ totalItems: result.totalItems, totalPages }} />
      {result.books.length === 0 ? <NothingHere route={route} /> : <BookList books={result.books} />}
      <Paginator route={route} totalPages={totalPages} />
    </div>
  );
}

function StartTyping() {
  return (
    <StatusMessage title="Find a book">
      Start typing a title, an author or a subject. Results appear as you type.
    </StatusMessage>
  );
}

/**
 * Google's total is an estimate, so a page it promised can turn out empty.
 * On page 1 that means no matches; later on, it means we've run out.
 */
function NothingHere({ route }: { route: SearchRoute }) {
  if (route.page === 1)
    return (
      <StatusMessage title={`No books found for “${route.query.trim()}”`}>Try fewer or different words.</StatusMessage>
    );
  return (
    <StatusMessage title="No more results">
      Google estimated more books than it actually returned.{" "}
      <Link to={{ ...route, page: 1 }} className="text-slate underline hover:text-rust">
        Back to page 1
      </Link>
    </StatusMessage>
  );
}
