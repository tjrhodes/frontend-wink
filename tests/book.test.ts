/** Turning Google's patchy data into complete Book objects. */
import { describe, expect, it } from "vitest";
import { publicationYear, toBook, toBookSearchResult } from "../src/books/book";
import { PLACEHOLDER_COVER_URL } from "../src/config";

describe("toBook", () => {
  it("fills every gap when Google sends almost nothing", () => {
    const book = toBook({ id: "x1" });
    expect(book).toMatchObject({ id: "x1", title: "Untitled", authors: [], summary: "", categories: [] });
    expect(book.coverUrl).toBe(PLACEHOLDER_COVER_URL);
  });

  it("uses the biggest cover available, over https", () => {
    const imageLinks = { thumbnail: "http://books.google.com/t.jpg", medium: "http://books.google.com/m.jpg" };
    expect(toBook({ id: "x2", volumeInfo: { imageLinks } }).coverUrl).toBe("https://books.google.com/m.jpg");
  });

  it("keeps the HTML description for the book page, and plain text for the list", () => {
    const book = toBook({ id: "x3", volumeInfo: { description: "<p>A <b>great</b> book</p>" } });
    expect(book.summary).toBe("A great book");
    expect(book.descriptionHtml).toBe("<p>A <b>great</b> book</p>");
  });
});

describe("toBookSearchResult", () => {
  it("treats a search with no matches (no `items` at all) as an empty list", () => {
    expect(toBookSearchResult({ totalItems: 0 })).toEqual({ books: [], totalItems: 0 });
  });
});

describe("publicationYear", () => {
  it("takes the year from any of Google's date formats", () => {
    expect(publicationYear(toBook({ id: "x4", volumeInfo: { publishedDate: "2004-05-12" } }))).toBe("2004");
  });
});
