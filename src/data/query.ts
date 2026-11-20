import type { AirQualityRow, ColumnKey } from "./airQuality";

export type SortDirection = "asc" | "desc";

export interface Query {
  search: string;
  period: string; // "all" or one period name
  sortKey: ColumnKey | null;
  sortDirection: SortDirection;
}

export function getPeriods(rows: AirQualityRow[]): string[] {
  return [...new Set(rows.map((row) => row.period))].sort();
}

export function queryRows(rows: AirQualityRow[], query: Query): AirQualityRow[] {
  const needle = query.search.trim().toLowerCase();

  // filter() returns a new array, so sorting it below never touches the input.
  const filtered = rows.filter((row) => {
    if (query.period !== "all" && row.period !== query.period) return false;
    if (needle === "") return true;
    return `${row.date} ${row.time} ${row.period}`.toLowerCase().includes(needle);
  });

  const { sortKey } = query;
  if (sortKey === null) return filtered;

  const direction = query.sortDirection === "asc" ? 1 : -1;
  return filtered.sort((x, y) => {
    const a = x[sortKey];
    const b = y[sortKey];
    if (a === null && b === null) return 0;
    if (a === null) return 1; // missing values always go last
    if (b === null) return -1;
    if (typeof a === "number" && typeof b === "number") return (a - b) * direction;
    return String(a).localeCompare(String(b)) * direction;
  });
}