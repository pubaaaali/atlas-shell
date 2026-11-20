import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { COLUMNS, type AirQualityRow, type ColumnKey } from "../data/airQuality";
import { getPeriods, queryRows, type Query } from "../data/query";
import { useAirQualityData } from "../data/useAirQualityData";
import { virtualPadding } from "../data/virtualPadding";
import { useUpdateTimer } from "../hooks/useUpdateTimer";

const NO_ROWS: AirQualityRow[] = [];
const ROW_HEIGHT = 34;

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

interface DataExplorerProps {
  initialVirtualised?: boolean;
}

export default function DataExplorer({ initialVirtualised = true }: DataExplorerProps) {
  const state = useAirQualityData();
  const [query, setQuery] = useState<Query>({
    search: "",
    period: "all",
    sortKey: null,
    sortDirection: "asc",
  });
  const [virtualised, setVirtualised] = useState(initialVirtualised);
  const [updateMs, timed] = useUpdateTimer();
  const scrollRef = useRef<HTMLDivElement>(null);

  const rows = state.status === "ready" ? state.rows : NO_ROWS;
  const periods = useMemo(() => getPeriods(rows), [rows]);
  const visible = useMemo(() => queryRows(rows, query), [rows, query]);

  const virtualizer = useVirtualizer({
    count: visible.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
    enabled: virtualised,
  });

  // Jump back to the top whenever the sort or filter changes.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [query]);

  function toggleSort(key: ColumnKey) {
    timed(() =>
      setQuery((current) =>
        current.sortKey === key
          ? { ...current, sortDirection: current.sortDirection === "asc" ? "desc" : "asc" }
          : { ...current, sortKey: key, sortDirection: "asc" },
      ),
    );
  }

  if (state.status === "loading") {
    return <p role="status">Loading air quality data...</p>;
  }
  if (state.status === "error") {
    return <p role="alert">Could not load the data: {state.message}</p>;
  }

  const items = virtualised ? virtualizer.getVirtualItems() : [];
  const { top, bottom } = virtualPadding(items, virtualizer.getTotalSize());

  const rowsToRender: { index: number; row: AirQualityRow }[] = [];
  if (virtualised) {
    for (const item of items) {
      const row = visible[item.index];
      if (row) rowsToRender.push({ index: item.index, row });
    }
  } else {
    visible.forEach((row, index) => rowsToRender.push({ index, row }));
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
            onChange={(event) =>
              timed(() => setQuery({ ...query, search: event.target.value }))
            }
          />
        </label>
        <label>
          Period
          <select
            value={query.period}
            onChange={(event) =>
              timed(() => setQuery({ ...query, period: event.target.value }))
            }
          >
            <option value="all">All periods</option>
            {periods.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={virtualised}
            onChange={(event) => timed(() => setVirtualised(event.target.checked))}
          />
          Virtualise rows
        </label>
        <p className="muted" role="status">
          Showing {visible.length.toLocaleString()} of {rows.length.toLocaleString()} readings
        </p>
      </div>
      <p className="perf muted">
        Rows in the DOM: {rowsToRender.length.toLocaleString()} of{" "}
        {visible.length.toLocaleString()}.{" "}
        {updateMs === null
          ? "Click a column header to time an update."
          : `Last update to paint: ${updateMs.toFixed(0)} ms.`}
      </p>
      <div className="table-wrap" ref={scrollRef}>
        <table aria-rowcount={visible.length + 1}>
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
            {top > 0 && (
              <tr aria-hidden="true">
                <td
                  colSpan={COLUMNS.length}
                  style={{ height: top, padding: 0, border: 0 }}
                />
              </tr>
            )}
            {rowsToRender.map(({ index, row }) => (
              <tr
                key={row.id}
                data-index={index}
                aria-rowindex={index + 2}
                ref={virtualised ? virtualizer.measureElement : undefined}
              >
                {COLUMNS.map((column) => (
                  <td key={column.key} className={column.numeric ? "num" : undefined}>
                    {formatCell(row[column.key])}
                  </td>
                ))}
              </tr>
            ))}
            {bottom > 0 && (
              <tr aria-hidden="true">
                <td
                  colSpan={COLUMNS.length}
                  style={{ height: bottom, padding: 0, border: 0 }}
                />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}