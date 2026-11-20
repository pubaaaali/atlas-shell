import { useMemo, useState } from "react";
import { COLUMNS, type AirQualityRow, type ColumnKey } from "../data/airQuality";
import { getPeriods, queryRows, type Query } from "../data/query";
import { useAirQualityData } from "../data/useAirQualityData";

const NO_ROWS: AirQualityRow[] = [];

function ariaSort(query: Query, key: ColumnKey): "ascending" | "descending" | "none" {
  if (query.sortKey !== key) return "none";
  return query.sortDirection === "asc" ? "ascending" : "descending";
}

function sortIndicator(query: Query, key: ColumnKey): string {
  if (query.sortKey !== key) return "";
  return query.sortDirection === "asc" ? " ▲" : " ▼";
}

function formatCell(value: string | number | null): string {
  return value === null ? "n/a" : String(value);
}

export default function DataExplorer() {
  const state = useAirQualityData();
  const [query, setQuery] = useState<Query>({
    search: "",
    period: "all",
    sortKey: null,
    sortDirection: "asc",
  });

  const rows = state.status === "ready" ? state.rows : NO_ROWS;
  const periods = useMemo(() => getPeriods(rows), [rows]);
  const visible = useMemo(() => queryRows(rows, query), [rows, query]);

  function toggleSort(key: ColumnKey) {
    setQuery((current) =>
      current.sortKey === key
        ? { ...current, sortDirection: current.sortDirection === "asc" ? "desc" : "asc" }
        : { ...current, sortKey: key, sortDirection: "asc" },
    );
  }

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
          Search
          <input
            type="search"
            value={query.search}
            placeholder="Date, time or period"
            onChange={(event) => setQuery({ ...query, search: event.target.value })}
          />
        </label>
        <label>
          Period
          <select
            value={query.period}
            onChange={(event) => setQuery({ ...query, period: event.target.value })}
          >
            <option value="all">All periods</option>
            {periods.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
        </label>
        <p className="muted" role="status">
          Showing {visible.length.toLocaleString()} of {rows.length.toLocaleString()} readings
        </p>
      </div>
      <div className="table-wrap">
        <table>
          <caption className="sr-only">Hourly air quality readings</caption>
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th key={column.key} scope="col" aria-sort={ariaSort(query, column.key)}>
                  <button type="button" onClick={() => toggleSort(column.key)}>
                    {column.label}
                    <span aria-hidden="true">{sortIndicator(query, column.key)}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                {COLUMNS.map((column) => (
                  <td key={column.key} className={column.numeric ? "num" : undefined}>
                    {formatCell(row[column.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}