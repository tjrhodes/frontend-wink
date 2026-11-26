/**
 * One book's page: everything Google knows about it, and its link (infoLink).
 * The page loads the book by its id, so this address works when shared or refreshed.
 */
import { useGetBookQuery } from "../books/booksApi";
import { messageForRequestError } from "../books/errorMessages";
import { BackToResults } from "../routing/BackToResults";
import { StatusMessage } from "../ui/StatusMessage";
import { useDocumentTitle } from "../ui/useDocumentTitle";
import { BookDetails, BookHeaderFrame, HEADER_COVER } from "./BookDetails";

export function BookScreen({ bookId }: { bookId: string }) {
  const { data: book, error, isError } = useGetBookQuery(bookId);
  useDocumentTitle(book?.title);

  if (isError) return <BookProblem message={messageForRequestError(error)} />;
  if (!book) return <BookLoading />;
  return <BookDetails book={book} />;
}

function BookProblem({ message }: { message: string | null }) {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-10">
      <StatusMessage tone="problem" title="This book can't be shown">
        {message}
      </StatusMessage>
      <BackToResults />
    </div>
  );
}

/** The real header's frame, with placeholders where the cover and title will go. */
function BookLoading() {
  const cover = <div className={`${HEADER_COVER} aspect-[2/3] animate-pulse rounded-card bg-rock-lift`} />;
  return (
    <div aria-busy aria-label="Loading book">
      <BookHeaderFrame cover={cover}>
        <div className="h-10 w-3/4 animate-pulse rounded bg-rock-lift sm:h-12" />
        <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-rock-lift" />
      </BookHeaderFrame>
    </div>
  );
}
