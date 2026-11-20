import { describe, expect, it } from "vitest";
import { virtualPadding } from "./virtualPadding";

describe("virtualPadding", () => {
  it("needs no padding when nothing is rendered", () => {
    expect(virtualPadding([], 6800)).toEqual({ top: 0, bottom: 0 });
  });

  it("pads above and below a window in the middle of the list", () => {
    const items = [
      { start: 340, end: 374 },
      { start: 374, end: 408 },
    ];
    expect(virtualPadding(items, 6800)).toEqual({ top: 340, bottom: 6392 });
  });

  it("has no bottom padding at the end of the list", () => {
    expect(virtualPadding([{ start: 6766, end: 6800 }], 6800)).toEqual({
      top: 6766,
      bottom: 0,
    });
  });
});