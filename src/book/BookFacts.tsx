/**
 * The facts about a book (publisher, date, pages, categories, language),
 * listing only the ones Google actually knows.
 */
import type { Book } from "../books/book";

const languageNames = new Intl.DisplayNames(["en"], { type: "language" });

export function BookFacts({ book }: { book: Book }) {
  const knownFacts = factsAbout(book).filter(([, value]) => Boolean(value));
  if (knownFacts.length === 0) return null;
  return (
    <dl className="space-y-3 border-t-2 border-rock pt-4">
      {knownFacts.map(([label, value]) => (
        <div key={label}>
          <dt className="kicker text-xs text-ember">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Each fact as [label, value]; a missing value is left empty and filtered out above. */
function factsAbout(book: Book): [string, string | undefined][] {
  return [
    ["Publisher", book.publisher],
    ["Published", book.publishedDate],
    ["Pages", book.pageCount?.toString()],
    ["Categories", book.categories.join(", ")],
    ["Language", book.language && readableLanguage(book.language)],
  ];
}

/** "it" becomes "Italian". Unknown codes are shown as they are. */
function readableLanguage(code: string): string {
  try {
    return languageNames.of(code) ?? code;
  } catch {
    return code;
  }
}
