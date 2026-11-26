/**
 * The search screen: the search field on a band of rock navy, and the results below.
 */
import { messageForRequestError } from "../books/errorMessages";
import { useLiveBookSearch } from "../books/useLiveBookSearch";
import type { BookSearchResult } from "../books/book";
import { Link } from "../routing/Link";
import type { SearchRoute } from "../routing/routes";
import { BAND_BACKGROUND } from "../ui/band";
import { ProblemNotice } from "../ui/ProblemNotice";
import { StatusMessage } from "../ui/StatusMessage";
import { useDocumentTitle } from "../ui/useDocumentTitle";
import { BookList } from "./BookList";
import { Paginator } from "./Paginator";
import { ResultsToolbar } from "./ResultsToolbar";
import { SearchBox } from "./SearchBox";
import { SkeletonList } from "./SkeletonList";
import { usePagingFacts } from "./usePagingFacts";

export function SearchScreen({ route }: { route: SearchRoute }) {
  useDocumentTitle(route.query.trim() || undefined);
  return (
    <>
      <section data-band className={BAND_BACKGROUND}>
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
  return <ResultsPage route={route} result={result} isFetching={isFetching} />;
}

type ResultsPageProps = { route: SearchRoute; result: BookSearchResult; isFetching: boolean };

/** A page of results, with the count above and the paginator below. */
function ResultsPage({ route, result, isFetching }: ResultsPageProps) {
  const { hasNextPage, estimatedTotal } = usePagingFacts(route, result);
  return (
    // While a newer search is on its way, these results stay where they are, dimmed.
    <div aria-busy={isFetching} className={`transition-opacity ${isFetching ? "opacity-60" : ""}`}>
      <ResultsToolbar route={route} estimatedTotal={estimatedTotal} />
      {result.books.length === 0 ? <NothingHere route={route} /> : <BookList books={result.books} />}
      <Paginator route={route} hasNextPage={hasNextPage} />
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
 * On page 1, no books means no matches. Later on, it means Google's results
 * ran out before its own estimate said they would (see usePagingFacts.ts).
 */
function NothingHere({ route }: { route: SearchRoute }) {
  if (route.page === 1)
    return (
      <StatusMessage title={`No books found for “${route.query.trim()}”`}>Try fewer or different words.</StatusMessage>
    );
  return (
    <StatusMessage title="That's the end of the results">
      Google's results stop before page {route.page}.{" "}
      <Link to={{ ...route, page: route.page - 1 }} className="text-slate underline hover:text-rust">
        Back to page {route.page - 1}
      </Link>
    </StatusMessage>
  );
}
