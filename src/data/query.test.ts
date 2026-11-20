import { describe, expect, it } from "vitest";
import type { AirQualityRow } from "./airQuality";
import { getPeriods, queryRows, type Query } from "./query";

const row = (id: number, overrides: Partial<AirQualityRow>): AirQualityRow => ({
  id,
  date: "2004-03-10",
  time: "18:00",
  co: 1,
  benzene: 1,
  nox: 1,
  no2: 1,
  temperature: 10,
  humidity: 50,
  absoluteHumidity: 0.7,
  hour: 18,
  period: "Night",
  ...overrides,
});

const base: Query = { search: "", period: "all", sortKey: null, sortDirection: "asc" };

const rows = [
  row(0, { co: 3, period: "Night" }),
  row(1, { co: null, period: "Morning Rush", date: "2004-03-11" }),
  row(2, { co: 1, period: "Night" }),
];

const ids = (result: AirQualityRow[]) => result.map((r) => r.id);

describe("queryRows", () => {
  it("filters by period", () => {
    expect(ids(queryRows(rows, { ...base, period: "Night" }))).toEqual([0, 2]);
  });

  it("filters by search text", () => {
    expect(ids(queryRows(rows, { ...base, search: "03-11" }))).toEqual([1]);
  });

  it("sorts numbers both ways with missing values last", () => {
    expect(ids(queryRows(rows, { ...base, sortKey: "co" }))).toEqual([2, 0, 1]);
    expect(
      ids(queryRows(rows, { ...base, sortKey: "co", sortDirection: "desc" })),
    ).toEqual([0, 2, 1]);
  });

  it("does not change the original array", () => {
    const copy = [...rows];
    queryRows(rows, { ...base, sortKey: "co" });
    expect(rows).toEqual(copy);
  });
});

describe("getPeriods", () => {
  it("returns unique periods in order", () => {
    expect(getPeriods(rows)).toEqual(["Morning Rush", "Night"]);
  });
});