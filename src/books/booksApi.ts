/**
 * Every call to Google Books, described with RTK Query.
 *
 * RTK Query keeps answers in a cache (going back to a page you've seen is
 * instant), tracks loading and errors for us, and lets us cancel requests
 * that are no longer needed (see useLiveBookSearch.ts).
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { GOOGLE_BOOKS_API_KEY, GOOGLE_BOOKS_URL, type PageSize } from "../config";
import { toBook, toBookSearchResult, type Book, type BookSearchResult } from "./book";

export interface BookSearchRequest {
  query: string;
  page: number;
  pageSize: PageSize;
}

export const booksApi = createApi({
  reducerPath: "booksApi",
  baseQuery: fetchBaseQuery({ baseUrl: GOOGLE_BOOKS_URL }),
  endpoints: (build) => ({
    searchBooks: build.query<BookSearchResult, BookSearchRequest>({
      query: (request) => ({ url: "", params: withApiKey(searchParams(request)) }),
      transformResponse: toBookSearchResult,
    }),
    getBook: build.query<Book, string>({
      query: (bookId) => ({ url: `/${encodeURIComponent(bookId)}`, params: withApiKey({}) }),
      transformResponse: toBook,
    }),
  }),
});

export const { useLazySearchBooksQuery, useGetBookQuery } = booksApi;

/**
 * Pagination uses Google's own parameters, as the brief asks:
 * `startIndex` is where the page begins (counting from 0), `maxResults` its size.
 */
function searchParams({ query, page, pageSize }: BookSearchRequest) {
  return { q: query.trim(), startIndex: (page - 1) * pageSize, maxResults: pageSize };
}

/** Adds the API key to a request, but only when one is configured. */
function withApiKey(params: Record<string, string | number>) {
  return GOOGLE_BOOKS_API_KEY ? { ...params, key: GOOGLE_BOOKS_API_KEY } : params;
}
