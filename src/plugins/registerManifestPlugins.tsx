import type { ComponentType } from "react";
import type { MetricKey } from "../data/aggregate";
import { getWorkload, registerWorkload } from "../shell/registry";
import { parseManifest } from "./manifest";
import SummaryWidget from "./SummaryWidget";

function createSummaryWorkload(metric: MetricKey): ComponentType {
  return function SummaryWorkload() {
    return <SummaryWidget metric={metric} />;
  };
}

// Returns a list of warnings for entries that were skipped.
export async function registerManifestPlugins(url: string): Promise<string[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Plugin manifest request failed (${response.status})`);
  }

  const { plugins, skipped } = parseManifest(await response.json());

  for (const plugin of plugins) {
    // A plugin may never replace a workload that is already registered.
    if (getWorkload(plugin.id)) {
      skipped.push(`"${plugin.id}" is already registered`);
      continue;
    }
    registerWorkload({
      id: plugin.id,
      title: plugin.title,
      description: plugin.description,
      icon: plugin.icon,
      load: async () => ({ default: createSummaryWorkload(plugin.metric) }),
    });
  }

  return skipped;
}