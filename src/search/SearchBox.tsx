/**
 * The search field. Every character typed updates the address (and so the
 * results) straight away, which is the brief's "live" search.
 */
import { useEffect, useState } from "react";
import { goTo } from "../routing/navigation";
import type { SearchRoute } from "../routing/routes";

export function SearchBox({ route }: { route: SearchRoute }) {
  // The field keeps its own copy of the text, so typing is never slowed down
  // by the router. The address is still the source of truth:
  const [typedText, setTypedText] = useState(route.query);
  // when it changes some other way (Back, a link), the field follows it.
  useEffect(() => setTypedText(route.query), [route.query]);

  /** A new search always starts from page 1, and replaces the history entry instead of adding one. */
  function searchFor(text: string) {
    setTypedText(text);
    goTo({ ...route, query: text, page: 1 }, { replace: true });
  }

  return (
    <form role="search" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="book-search" className="kicker mb-3 block text-lichen">
        Search Google Books
      </label>
      <input
        id="book-search"
        type="search"
        value={typedText}
        onChange={(event) => searchFor(event.target.value)}
        placeholder="Title, author, subject…"
        autoComplete="off"
        spellCheck={false}
        // Ready to type on arrival, but only when there's nothing typed yet:
        // on phones, focusing would pop the keyboard over results you came back to.
        data-autofocus={route.query ? undefined : true}
        className="w-full rounded-card border-2 border-transparent bg-paper px-5 py-4 text-xl text-ink shadow-lg shadow-crevice/30 outline-none placeholder:text-mute/70 focus:border-lichen"
      />
    </form>
  );
}
