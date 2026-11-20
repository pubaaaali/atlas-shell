import { METRIC_BY_KEY, type MetricKey } from "../data/aggregate";
import { summarise } from "../data/summary";
import { useAirQualityData } from "../data/useAirQualityData";

interface SummaryWidgetProps {
  metric: MetricKey;
}

function format(value: number | null): string {
  return value === null ? "n/a" : value.toFixed(2);
}

export default function SummaryWidget({ metric }: SummaryWidgetProps) {
  const state = useAirQualityData();

  if (state.status === "loading") {
    return <p role="status">Loading air quality data...</p>;
  }
  if (state.status === "error") {
    return <p role="alert">Could not load the data: {state.message}</p>;
  }

  const info = METRIC_BY_KEY[metric];
  const stats = summarise(state.rows, metric);

  return (
    <div>
      <h2>
        {info.label} summary <span className="muted">({info.unit})</span>
      </h2>
      <dl className="stat-grid">
        <div className="stat">
          <dt>Minimum</dt>
          <dd>{format(stats.min)}</dd>
        </div>
        <div className="stat">
          <dt>Maximum</dt>
          <dd>{format(stats.max)}</dd>
        </div>
        <div className="stat">
          <dt>Average</dt>
          <dd>{format(stats.mean)}</dd>
        </div>
        <div className="stat">
          <dt>Readings</dt>
          <dd>{stats.count.toLocaleString()}</dd>
        </div>
        <div className="stat">
          <dt>Missing</dt>
          <dd>{stats.missing.toLocaleString()}</dd>
        </div>
      </dl>
    </div>
  );
}