import { describe, expect, it } from "vitest";
import { parseManifest } from "./manifest";

const valid = {
  id: "co-summary",
  title: "CO Summary",
  description: "Min, max and average CO.",
  icon: "🧪",
  kind: "summary",
  metric: "co",
};

describe("parseManifest", () => {
  it("accepts a valid plugin entry", () => {
    expect(parseManifest({ plugins: [valid] })).toEqual({ plugins: [valid], skipped: [] });
  });

  it("skips entries with an unsupported kind", () => {
    const result = parseManifest({ plugins: [{ ...valid, kind: "script" }] });
    expect(result.plugins).toEqual([]);
    expect(result.skipped[0]).toMatch(/unsupported kind/i);
  });

  it("skips entries with an unknown metric", () => {
    const result = parseManifest({ plugins: [{ ...valid, metric: "ozone" }] });
    expect(result.plugins).toEqual([]);
    expect(result.skipped[0]).toMatch(/unknown metric/i);
  });

  it("skips entries with an invalid id", () => {
    const result = parseManifest({ plugins: [{ ...valid, id: "Bad Id!" }] });
    expect(result.plugins).toEqual([]);
    expect(result.skipped[0]).toMatch(/invalid id/i);
  });

  it("keeps the first of two entries with the same id", () => {
    const result = parseManifest({ plugins: [valid, { ...valid, title: "Other" }] });
    expect(result.plugins).toHaveLength(1);
    expect(result.plugins[0]?.title).toBe("CO Summary");
    expect(result.skipped[0]).toMatch(/duplicate/i);
  });

  it("throws when the manifest has no plugins array", () => {
    expect(() => parseManifest({})).toThrow(/plugins/);
  });
});