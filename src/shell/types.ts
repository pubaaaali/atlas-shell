import type { ComponentType } from "react";

export interface WorkloadDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  load: () => Promise<{ default: ComponentType }>;
}