import { describe, expect, it } from "vitest";
import { countPages, pageNumbersAround } from "../src/search/pageNumbers";

describe("pageNumbersAround", () => {
  it("shows every page when there are only a few", () => {
    expect(pageNumbersAround(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it("shows first, last and neighbours, with gaps in between", () => {
    expect(pageNumbersAround(6, 20)).toEqual([1, "gap", 5, 6, 7, "gap", 20]);
  });

  it("doesn't add a gap at the edges", () => {
    expect(pageNumbersAround(1, 20)).toEqual([1, 2, "gap", 20]);
    expect(pageNumbersAround(20, 20)).toEqual([1, "gap", 19, 20]);
  });
});

describe("countPages", () => {
  it("rounds up, and never says zero pages", () => {
    expect(countPages(47, 10)).toBe(5);
    expect(countPages(0, 10)).toBe(1);
  });
});
