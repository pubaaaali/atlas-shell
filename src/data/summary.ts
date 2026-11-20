import type { MetricKey } from "./aggregate";
import type { AirQualityRow } from "./airQuality";

export interface Summary {
  count: number;
  missing: number;
  min: number | null;
  max: number | null;
  mean: number | null;
}

export function summarise(rows: AirQualityRow[], metric: MetricKey): Summary {
  let count = 0;
  let missing = 0;
  let total = 0;
  let min = Infinity;
  let max = -Infinity;

  for (const row of rows) {
    const value = row[metric];
    if (value === null) {
      missing += 1;
      continue;
    }
    count += 1;
    total += value;
    if (value < min) min = value;
    if (value > max) max = value;
  }

  if (count === 0) return { count, missing, min: null, max: null, mean: null };
  return { count, missing, min, max, mean: total / count };
}