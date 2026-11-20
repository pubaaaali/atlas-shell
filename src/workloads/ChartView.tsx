import { useMemo, useState } from "react";
import SeriesChart from "../charts/SeriesChart";
import {
  METRIC_BY_KEY,
  METRICS,
  dailyAverages,
  hourlyAverages,
  type MetricKey,
} from "../data/aggregate";
import type { AirQualityRow } from "../data/airQuality";
import { useAirQualityData } from "../data/useAirQualityData";

const NO_ROWS: AirQualityRow[] = [];

export default function ChartView() {
  const state = useAirQualityData();
  const [metricKey, setMetricKey] = useState<MetricKey>("co");
  const metric = METRIC_BY_KEY[metricKey];

  const rows = state.status === "ready" ? state.rows : NO_ROWS;
  const daily = useMemo(() => dailyAverages(rows, metricKey), [rows, metricKey]);
  const hourly = useMemo(() => hourlyAverages(rows, metricKey), [rows, metricKey]);

  if (state.status === "loading") {
    return <p role="status">Loading air quality data...</p>;
  }
  if (state.status === "error") {
    return <p role="alert">Could not load the data: {state.message}</p>;
  }

  return (
    <div>
      <div className="explorer-controls">
        <label>
          Measurement
          <select
            value={metricKey}
            onChange={(event) => setMetricKey(event.target.value as MetricKey)}
          >
            {METRICS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <p className="muted">
          Based on {rows.length.toLocaleString()} hourly readings. Missing readings are
          ignored.
        </p>
      </div>
      <SeriesChart
        title={`Daily average ${metric.label}`}
        unit={metric.unit}
        points={daily}
        kind="line"
      />
      <SeriesChart
        title={`Average ${metric.label} by hour of day`}
        unit={metric.unit}
        points={hourly}
        kind="bar"
      />
    </div>
  );
}