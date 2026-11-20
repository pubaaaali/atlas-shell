import type { Point } from "../data/aggregate";

interface SeriesChartProps {
  title: string;
  unit: string;
  points: Point[];
  kind: "line" | "bar";
}

const WIDTH = 720;
const HEIGHT = 320;
const MARGIN = { top: 16, right: 16, bottom: 36, left: 56 };
const INNER_W = WIDTH - MARGIN.left - MARGIN.right;
const INNER_H = HEIGHT - MARGIN.top - MARGIN.bottom;

function formatValue(value: number): string {
  return Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1);
}

function tickValues(lower: number, upper: number, count: number): number[] {
  const step = (upper - lower) / (count - 1);
  return Array.from({ length: count }, (_, i) => lower + step * i);
}

export default function SeriesChart({ title, unit, points, kind }: SeriesChartProps) {
  if (points.length === 0) {
    return <p role="status">No data available for {title}.</p>;
  }

  const lowest = points.reduce((a, b) => (b.value < a.value ? b : a));
  const highest = points.reduce((a, b) => (b.value > a.value ? b : a));
  const lower = kind === "bar" ? Math.min(0, lowest.value) : lowest.value;
  const upper = highest.value === lower ? lower + 1 : highest.value;

  const yOf = (value: number) =>
    MARGIN.top + INNER_H - ((value - lower) / (upper - lower)) * INNER_H;
  const band = INNER_W / points.length;
  const xOf = (index: number) =>
    kind === "bar"
      ? MARGIN.left + band * index + band / 2
      : MARGIN.left +
        (points.length === 1 ? INNER_W / 2 : (index / (points.length - 1)) * INNER_W);

  const zeroY = yOf(Math.min(Math.max(0, lower), upper));
  const labelEvery = Math.ceil(points.length / 6);
  const path = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${xOf(index).toFixed(1)},${yOf(point.value).toFixed(1)}`,
    )
    .join(" ");

  return (
    <figure className="chart">
      <h2>
        {title} <span className="muted">({unit})</span>
      </h2>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`${title} (${unit})`}>
        {tickValues(lower, upper, 5).map((tick) => (
          <g key={tick}>
            <line
              className="chart-grid"
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={yOf(tick)}
              y2={yOf(tick)}
            />
            <text
              className="chart-axis-label"
              x={MARGIN.left - 8}
              y={yOf(tick)}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {formatValue(tick)}
            </text>
          </g>
        ))}
        {kind === "line" ? (
          <path className="chart-line" d={path} />
        ) : (
          points.map((point, index) => (
            <rect
              key={point.label}
              className="chart-bar"
              x={xOf(index) - (band * 0.7) / 2}
              y={Math.min(yOf(point.value), zeroY)}
              width={band * 0.7}
              height={Math.abs(yOf(point.value) - zeroY)}
            />
          ))
        )}
        {points.map((point, index) =>
          index % labelEvery === 0 ? (
            <text
              key={point.label}
              className="chart-axis-label"
              x={xOf(index)}
              y={HEIGHT - 12}
              textAnchor="middle"
            >
              {point.label}
            </text>
          ) : null,
        )}
      </svg>
      <figcaption className="muted">
        Highest: {formatValue(highest.value)} {unit} ({highest.label}). Lowest:{" "}
        {formatValue(lowest.value)} {unit} ({lowest.label}).
      </figcaption>
    </figure>
  );
}