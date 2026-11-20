import { describe, expect, it } from "vitest";
import type { AirQualityRow } from "./airQuality";
import { summarise } from "./summary";

const row = (id: number, co: number | null): AirQualityRow => ({
  id,
  date: "2004-03-10",
  time: "18:00",
  co,
  benzene: 1,
  nox: 1,
  no2: 1,
  temperature: 10,
  humidity: 50,
  absoluteHumidity: 0.7,
  hour: 18,
  period: "Night",
});

describe("summarise", () => {
  it("computes min, max and mean and counts missing values", () => {
    expect(summarise([row(0, 2), row(1, 4), row(2, null)], "co")).toEqual({
      count: 2,
      missing: 1,
      min: 2,
      max: 4,
      mean: 3,
    });
  });

  it("returns nulls when every value is missing", () => {
    expect(summarise([row(0, null)], "co")).toEqual({
      count: 0,
      missing: 1,
      min: null,
      max: null,
      mean: null,
    });
  });

  it("handles no rows", () => {
    expect(summarise([], "co")).toEqual({
      count: 0,
      missing: 0,
      min: null,
      max: null,
      mean: null,
    });
  });
});