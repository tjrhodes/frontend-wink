**English** · [Italiano](README.it.md)

# Book Search

A live search for Google Books: a responsive single-page app built with React, TypeScript, Redux Toolkit and Tailwind CSS.

**Try it: [frontend-wink.vercel.app](https://frontend-wink.vercel.app/)**

- Results update with every character typed.
- Pages use Google's own `startIndex` and `maxResults` parameters, with 5, 10, 15 or 20 books per page.
- Each book has its own page, with its details and a link to Google Books (`infoLink`).
- Every screen has a real address, so Back, Forward, refresh and shared links all work.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests
npm run build      # type-check and build to dist/
```

**Optional:** without an API key, Google allows only a few requests, and a live search spends them quickly. Copy `.env.example` to `.env` and add a Books API key as `VITE_GOOGLE_BOOKS_API_KEY`. On Vercel, add the same variable in the project settings.

## How it's put together

```
src/
  config.ts                    every fixed value: endpoint, page sizes, placeholder cover
  main.tsx                     start-up: router, first render, entrance animation
  App.tsx                      header, current screen, footer
  app/                         Redux store and typed hooks
  routing/
    routes.ts                  address ⇄ route translation (the only code that knows the URL format)
    navigation.ts              the router, on the Navigation API
    routeSlice.ts              the current route, in Redux
    Link.tsx, BackToResults.tsx
  transitions/                 GSAP page transition and reduced-motion handling
  ui/                          shared bits: the band background, status messages, notices
  books/
    book.ts                    the app's Book type, and the mapping from Google's data
    booksApi.ts                RTK Query endpoints for Google Books
    useLiveBookSearch.ts       the live search, with cancelling of stale requests
  search/                      search screen: field, results list, paginator, page size
  book/                        book screen: header, facts, description, Google Books link
  styles/
    theme.scss                 the colour palette (Sass), compiled to a Tailwind theme
    app.css                    Tailwind, fonts and base styles
tests/                         routes, pagination and data-mapping tests
```

## Decisions

### The address is the single source of truth

Search text, page and page size live in the query string (`/?q=dune&page=2&size=20`), and a book lives at `/book/:id`. The app reads everything from the address, through one function (`routeFromUrl`), and builds every link through another (`urlForRoute`). So any screen can be bookmarked, shared or refreshed, and the book page loads its own data from the id.

### Routing on the Navigation API, not React Router

The [Navigation API](https://developer.mozilla.org/docs/Web/API/Navigation_API) has worked in every major browser since January 2026. It gives one `navigate` event for every link click, Back/Forward press and programmatic navigation, which made a small, dependency-free router possible (`routing/navigation.ts`):

- Links are plain `<a href>` elements, so middle-click, "open in new tab" and copying a link behave normally.
- **Typing replaces the history entry instead of adding one.** Otherwise Back would undo the search one letter at a time. Changing page or opening a book adds a real entry.
- Scroll position comes back when you go Back to the results.
- Browsers without the API fall back to the History API, without the transitions.

### Live search and network management

The brief asks for a new search on every character, so there's deliberately no debounce. Instead:

- **Stale requests are cancelled.** When the search changes, the previous request is aborted, so the browser stops waiting for it.
- **Old answers can't overwrite new ones.** RTK Query shows only the answer for the latest search, so a slow, out-of-date response is never displayed.
- **Answers are cached.** Going back to a page or a search you've already seen is instant, with no new request.
- **Previous results stay visible, dimmed,** while the next answer loads. Nothing flickers.
- **Rate limits are retried.** Google's "too many requests" reply (429) is easy to hit with live search, especially without an API key. Those requests are retried automatically, after a short pause that grows each time.
- **Errors get plain explanations,** in a notice that floats over the page. Results you already have stay put.

### Nothing jumps

Every result row has the same fixed height: one line of title, one of authors, two of description. The loading placeholders are built from the same layout, and the toolbar is there from the first letter. Room for a full page of rows is reserved from the start, so nothing moves while results change under your typing. In a test typing "dune messiah" against delayed and rate-limited responses, Chrome measured a layout shift score of 0 once the first results were on screen. The book page's loading state uses the real header's frame, and the page always keeps room for the scrollbar.

### Google's data, handled in one place

`books/book.ts` turns Google's deep, mostly optional data into complete `Book` objects:

- missing fields get sensible defaults;
- the largest available cover is used, rewritten from `http` to `https`;
- books without a cover get the brief's placeholder (`placehold.co`, 400×600, `FF5039`, "Book Cover"), as do covers that fail to load;
- descriptions are kept both as plain text, for the two-line summary, and as HTML for the book page.

On the book page, the HTML is sanitised with DOMPurify before it's displayed.

### Paging without trusting Google's totals

Google's `totalItems` can't be used to work out a last page. I checked with real searches:

- **The total grows as you page.** For "kureishi", page 1 says 472, by result 30 it says 2,125, and later on 13,134.
- **The real results end much sooner,** at around 350.

A paginator built on that total links to pages that don't exist. So (`search/usePagingFacts.ts`):

- **The count is page 1's estimate,** shown as "About …" with no "of N". It doesn't creep upwards as you page.
- **The paginator never shows a last page.** It shows page 1, the pages just before the current one, and the next page only when it exists.
- **"Next" is offered only when it leads somewhere.** The current page must be full, and a quiet look-ahead at the next page mustn't have come back empty. The look-ahead waits until typing pauses, and it also means the next page opens instantly, from the cache.
- **If a page still comes back empty,** for example from an old link, it says the results have ended and links to the previous page.

### Theme colours in Sass

Tailwind v4 doesn't process Sass, so `styles/theme.scss` holds the palette as a Sass map. It also computes a few shades with Sass colour functions, and outputs a Tailwind `@theme` block. A small Vite plugin compiles it on start-up and whenever it's saved, and Tailwind turns each colour into utilities (`bg-rock`, `text-lichen`, …). The palette and the Fira Sans typography come from my portfolio site, [tomrhodes.it](https://tomrhodes.it).

### Motion

GSAP animates the change between screens. The blue band at the top stays on screen throughout:

1. On a book page, the title's letters drop away, last letter first.
2. The old content fades out, with a hard ease-in.
3. The band stretches or shrinks to the new screen's height, with a heavy ease-in-out.
4. The new content fades in, with a hard ease-out.
5. On a book page, the title builds letter by letter with GSAP's SplitText, each word in its own mask.

The title is split only while it animates, then restored to plain text, so React keeps control of it the rest of the time. Kerning and ligatures are off on the title, so the letters don't shift when they're split.

The band also allows for scrolling (`transitions/bandTransition.ts`). It only ever animates the part of the band you can actually see:

1. **When leaving,** it notes how many pixels of the band are showing: all of it, some, or none.
2. **Once the content has faded,** in a single frame, the page goes to the top and the stand-in band is set to exactly that height. Nothing visibly changes, even if the browser had scrolled a shorter new screen by itself.
3. **The band then grows or shrinks,** with the heavy ease, to however much of the new band will show at the new scroll position.
4. **The page jumps to its new position** in a single frame, and the content fades in.

So a fully visible band morphs, a partly scrolled one grows from what was showing, and a scrolled-away one grows from zero under the header, or shrinks back up to it. The router remembers each history entry's scroll position, so it knows where Back will land before it gets there.

While the old screen fades out, the router already loads what the new one needs (`routing/prepareRoute.ts`). For a book page, that's the book's details and then its cover image, waiting at most 0.4 seconds for the cover and 1.5 seconds overall. So the page arrives complete, and the band grows straight to its final height. If a cover is still loading, its box (already full size) shows a soft pulse and a tiny lichen spinner, and the image fades in once it arrives. Result covers do the same.

Every duration goes through one helper, so visitors who ask for reduced motion get instant changes instead. After each new screen, keyboard focus moves to the search field or the page heading.

## Deploying to Vercel

Import the repository on Vercel. It detects Vite and needs no settings. `vercel.json` sends every address to `index.html`, so links like `/book/abc123` work when opened directly.

Fonts: Fira Sans and Fira Sans Condensed, by Carrois Apostrophe, under the SIL Open Font License.
