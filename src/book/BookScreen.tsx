/**
 * One book's page: everything Google knows about it, and its link (infoLink).
 * The page loads the book by its id, so this address works when shared or refreshed.
 */
import { useGetBookQuery } from "../books/booksApi";
import { messageForRequestError } from "../books/errorMessages";
import { BackToResults } from "../routing/BackToResults";
import { StatusMessage } from "../ui/StatusMessage";
import { useDocumentTitle } from "../ui/useDocumentTitle";
import { BookDetails } from "./BookDetails";

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

/** A dark band the same height as the real header, so nothing jumps when the book arrives. */
function BookLoading() {
  return <div aria-busy aria-label="Loading book" className="h-96 animate-pulse bg-rock" />;
}
