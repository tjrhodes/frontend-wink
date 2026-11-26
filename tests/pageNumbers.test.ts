import { describe, expect, it } from "vitest";
import { pageNumbersAround } from "../src/search/pageNumbers";

describe("pageNumbersAround", () => {
  it("shows the next page only when it exists", () => {
    expect(pageNumbersAround(1, true)).toEqual([1, 2]);
    expect(pageNumbersAround(1, false)).toEqual([1]);
  });

  it("shows the two pages before the current one", () => {
    expect(pageNumbersAround(3, true)).toEqual([1, 2, 3, 4]);
  });

  it("keeps page 1 reachable, with a gap when pages are skipped", () => {
    expect(pageNumbersAround(4, true)).toEqual([1, 2, 3, 4, 5]);
    expect(pageNumbersAround(9, false)).toEqual([1, "gap", 7, 8, 9]);
  });
});
