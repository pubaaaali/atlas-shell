import type { AirQualityRow } from "./airQuality";

export type MetricKey = "co" | "benzene" | "nox" | "no2" | "temperature" | "humidity";

export interface Metric {
  key: MetricKey;
  label: string;
  unit: string;
}

export const METRIC_BY_KEY: Record<MetricKey, Metric> = {
  co: { key: "co", label: "CO", unit: "mg/m³" },
  benzene: { key: "benzene", label: "Benzene", unit: "µg/m³" },
  nox: { key: "nox", label: "NOx", unit: "ppb" },
  no2: { key: "no2", label: "NO₂", unit: "µg/m³" },
  temperature: { key: "temperature", label: "Temperature", unit: "°C" },
  humidity: { key: "humidity", label: "Relative humidity", unit: "%" },
};

export const METRICS: Metric[] = Object.values(METRIC_BY_KEY);

export interface Point {
  label: string;
  value: number;
}

function averageBy(
  rows: AirQualityRow[],
  metric: MetricKey,
  groupOf: (row: AirQualityRow) => string | null,
): Point[] {
  const sums = new Map<string, { total: number; count: number }>();

  for (const row of rows) {
    const value = row[metric];
    const group = groupOf(row);
    if (value === null || group === null) continue;
    const entry = sums.get(group) ?? { total: 0, count: 0 };
    entry.total += value;
    entry.count += 1;
    sums.set(group, entry);
  }

  return [...sums.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, { total, count }]) => ({ label, value: total / count }));
}

export function dailyAverages(rows: AirQualityRow[], metric: MetricKey): Point[] {
  return averageBy(rows, metric, (row) => row.date);
}

export function hourlyAverages(rows: AirQualityRow[], metric: MetricKey): Point[] {
  return averageBy(rows, metric, (row) =>
    row.hour === null ? null : String(row.hour).padStart(2, "0"),
  );
}