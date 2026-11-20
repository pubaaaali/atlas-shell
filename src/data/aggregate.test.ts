import { describe, expect, it } from "vitest";
import { dailyAverages, hourlyAverages } from "./aggregate";
import type { AirQualityRow } from "./airQuality";

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

const rows = [
  row(0, { date: "2004-03-11", hour: 9, co: 2 }),
  row(1, { date: "2004-03-10", hour: 9, co: 4 }),
  row(2, { date: "2004-03-10", hour: 18, co: 6 }),
  row(3, { date: "2004-03-10", hour: 18, co: null }),
];

describe("dailyAverages", () => {
  it("averages each day, sorts by date and ignores missing values", () => {
    expect(dailyAverages(rows, "co")).toEqual([
      { label: "2004-03-10", value: 5 },
      { label: "2004-03-11", value: 2 },
    ]);
  });

  it("returns nothing for empty input", () => {
    expect(dailyAverages([], "co")).toEqual([]);
  });
});

describe("hourlyAverages", () => {
  it("averages by hour of day with zero-padded labels", () => {
    expect(hourlyAverages(rows, "co")).toEqual([
      { label: "09", value: 3 },
      { label: "18", value: 6 },
    ]);
  });
});