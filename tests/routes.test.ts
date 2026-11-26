/** The address ⇄ route translation: the heart of deep links and the back button. */
import { describe, expect, it } from "vitest";
import { routeFromUrl, screenOf, urlForRoute, type Route } from "../src/routing/routes";

const routeAt = (address: string) => routeFromUrl(new URL(address, "https://example.com"));

describe("routeFromUrl", () => {
  it("reads a search, with its page and page size", () => {
    expect(routeAt("/?q=dune&page=3&size=20")).toEqual({ name: "search", query: "dune", page: 3, pageSize: 20 });
  });

  it("falls back to defaults for missing or invalid values", () => {
    expect(routeAt("/?q=dune&page=-2&size=7")).toEqual({ name: "search", query: "dune", page: 1, pageSize: 10 });
  });

  it("reads a book id, including unusual characters", () => {
    expect(routeAt("/book/a%2Fb-C_d")).toEqual({ name: "book", bookId: "a/b-C_d" });
  });

  it("knows when an address leads nowhere", () => {
    expect(routeAt("/somewhere/else")).toEqual({ name: "notFound" });
  });
});

describe("urlForRoute", () => {
  it("leaves default values out of the address", () => {
    expect(urlForRoute({ name: "search", query: "", page: 1, pageSize: 10 })).toBe("/");
  });

  it("gives back exactly the route it was built from", () => {
    const routes: Route[] = [
      { name: "search", query: "le guin & co", page: 4, pageSize: 5 },
      { name: "book", bookId: "a/b?c" },
    ];
    for (const route of routes) expect(routeAt(urlForRoute(route))).toEqual(route);
  });
});

describe("screenOf", () => {
  it("treats typing and paging as the same screen, but each book as its own", () => {
    expect(screenOf(routeAt("/?q=a"))).toBe(screenOf(routeAt("/?q=ab&page=2")));
    expect(screenOf(routeAt("/book/1"))).not.toBe(screenOf(routeAt("/book/2")));
  });
});
