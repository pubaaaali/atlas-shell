import { METRIC_BY_KEY, type MetricKey } from "../data/aggregate";

export interface SummaryPluginEntry {
  id: string;
  title: string;
  description: string;
  icon: string;
  kind: "summary";
  metric: MetricKey;
}

export interface ParsedManifest {
  plugins: SummaryPluginEntry[];
  skipped: string[];
}

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function isMetricKey(value: unknown): value is MetricKey {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(METRIC_BY_KEY, value)
  );
}

export function parseManifest(data: unknown): ParsedManifest {
  if (!isRecord(data) || !Array.isArray(data.plugins)) {
    throw new Error('Manifest must be an object with a "plugins" array');
  }

  const plugins: SummaryPluginEntry[] = [];
  const skipped: string[] = [];
  const seen = new Set<string>();

  data.plugins.forEach((entry: unknown, index: number) => {
    const label = `Plugin #${index + 1}`;
    if (!isRecord(entry)) {
      skipped.push(`${label}: not an object`);
      return;
    }

    const id = text(entry.id);
    if (id === null || !ID_PATTERN.test(id)) {
      skipped.push(`${label}: invalid id`);
      return;
    }
    if (seen.has(id)) {
      skipped.push(`${label} ("${id}"): duplicate id`);
      return;
    }

    const title = text(entry.title);
    const description = text(entry.description);
    const icon = text(entry.icon);
    if (title === null || description === null || icon === null) {
      skipped.push(`${label} ("${id}"): title, description and icon are required`);
      return;
    }
    if (entry.kind !== "summary") {
      skipped.push(`${label} ("${id}"): unsupported kind`);
      return;
    }
    if (!isMetricKey(entry.metric)) {
      skipped.push(`${label} ("${id}"): unknown metric`);
      return;
    }

    seen.add(id);
    plugins.push({ id, title, description, icon, kind: "summary", metric: entry.metric });
  });

  return { plugins, skipped };
}