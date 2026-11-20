export interface AirQualityRow {
  id: number;
  date: string; // ISO format, e.g. "2004-03-10", so it sorts correctly as text
  time: string; // "18:00"
  co: number | null; // mg/m³
  benzene: number | null; // µg/m³
  nox: number | null; // ppb
  no2: number | null; // µg/m³
  temperature: number | null; // °C
  humidity: number | null; // % relative humidity
  absoluteHumidity: number | null;
  hour: number | null;
  period: string;
}

export type ColumnKey = Exclude<keyof AirQualityRow, "id">;

export interface ColumnDef {
  key: ColumnKey;
  label: string;
  numeric: boolean;
}

export const COLUMNS: ColumnDef[] = [
  { key: "date", label: "Date", numeric: false },
  { key: "time", label: "Time", numeric: false },
  { key: "period", label: "Period", numeric: false },
  { key: "co", label: "CO (mg/m³)", numeric: true },
  { key: "benzene", label: "Benzene (µg/m³)", numeric: true },
  { key: "nox", label: "NOx (ppb)", numeric: true },
  { key: "no2", label: "NO₂ (µg/m³)", numeric: true },
  { key: "temperature", label: "Temp (°C)", numeric: true },
  { key: "humidity", label: "RH (%)", numeric: true },
];

// The UCI dataset uses -200 to mean "no reading".
const MISSING_VALUE = -200;

function toNumber(value: string | undefined): number | null {
  const text = (value ?? "").trim().replace(",", ".");
  if (text === "") return null;
  const parsed = Number(text);
  if (!Number.isFinite(parsed) || parsed === MISSING_VALUE) return null;
  return parsed;
}

function toIsoDate(value: string): string {
  const parts = value.trim().split("/");
  if (parts.length !== 3) return value.trim();
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function toTime(value: string): string {
  const [hours = "", minutes = "00"] = value.trim().split(".");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

// Simple comma split: this dataset has no quoted fields.
export function parseAirQualityCsv(text: string): AirQualityRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return [];

  const header = lines[0].split(",").map((name) => name.trim());
  const index = (name: string): number => {
    const position = header.indexOf(name);
    if (position === -1) throw new Error(`Missing column "${name}"`);
    return position;
  };

  const cols = {
    date: index("Date"),
    time: index("Time"),
    co: index("CO_GT"),
    benzene: index("C6H6_GT"),
    nox: index("NOx_GT"),
    no2: index("NO2_GT"),
    temperature: index("T"),
    humidity: index("RH"),
    absoluteHumidity: index("AH"),
    hour: index("Hour_int"),
    period: index("Period"),
  };

  return lines.slice(1).map((line, i) => {
    const cells = line.split(",");
    return {
      id: i,
      date: toIsoDate(cells[cols.date] ?? ""),
      time: toTime(cells[cols.time] ?? ""),
      co: toNumber(cells[cols.co]),
      benzene: toNumber(cells[cols.benzene]),
      nox: toNumber(cells[cols.nox]),
      no2: toNumber(cells[cols.no2]),
      temperature: toNumber(cells[cols.temperature]),
      humidity: toNumber(cells[cols.humidity]),
      absoluteHumidity: toNumber(cells[cols.absoluteHumidity]),
      hour: toNumber(cells[cols.hour]),
      period: (cells[cols.period] ?? "").trim(),
    };
  });
}