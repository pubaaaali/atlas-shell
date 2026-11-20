import { getWorkload, registerWorkload } from "../shell/registry";
import type { WorkloadDefinition } from "../shell/types";

const builtIn: WorkloadDefinition[] = [
  {
    id: "explorer",
    title: "Data Explorer",
    description: "Browse, sort and filter a dataset in a table.",
    icon: "📊",
    load: () => import("./DataExplorer"),
  },
  {
    id: "charts",
    title: "Chart View",
    description: "Explore trends in the same data as charts.",
    icon: "📈",
    load: () => import("./ChartView"),
  },
];

export function registerBuiltInWorkloads(): void {
  for (const workload of builtIn) {
    if (!getWorkload(workload.id)) registerWorkload(workload);
  }
}