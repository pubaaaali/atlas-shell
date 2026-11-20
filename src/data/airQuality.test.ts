import { describe, expect, it } from "vitest";
import { parseAirQualityCsv } from "./airQuality";

const SAMPLE = [
  "Date,Time,CO_GT,C6H6_GT,NOx_GT,NO2_GT,T,RH,AH,Hour_int,Period",
  "10/03/2004,18.00.00,2.6,11.9,166.0,113.0,13.6,48.9,0.7578,18,Evening Rush",
  "10/03/2004,19.00.00,-200,9.4,103.0,92.0,13.3,47.7,0.7255,19,Evening Rush",
].join("\n");

describe("parseAirQualityCsv", () => {
  it("parses rows with ISO dates and times", () => {
    const [first] = parseAirQualityCsv(SAMPLE);
    expect(first).toMatchObject({
      date: "2004-03-10",
      time: "18:00",
      co: 2.6,
      hour: 18,
      period: "Evening Rush",
    });
  });

  it("treats the -200 sentinel as a missing value", () => {
    const rows = parseAirQualityCsv(SAMPLE);
    expect(rows[1]?.co).toBeNull();
  });

  it("throws a clear error when a column is missing", () => {
    expect(() => parseAirQualityCsv("Date,Time\n1,2")).toThrow(/Missing column/);
  });

  it("returns no rows for empty input", () => {
    expect(parseAirQualityCsv("")).toEqual([]);
  });
});