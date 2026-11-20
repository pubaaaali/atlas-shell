import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { WorkloadDefinition } from "./types";

const definitions = new Map<string, WorkloadDefinition>();
const components = new Map<string, LazyExoticComponent<ComponentType>>();

export function registerWorkload(definition: WorkloadDefinition): void {
  if (definitions.has(definition.id)) {
    throw new Error(`Workload "${definition.id}" is already registered`);
  }
  definitions.set(definition.id, definition);
}

export function getWorkloads(): WorkloadDefinition[] {
  return [...definitions.values()];
}

export function getWorkload(id: string): WorkloadDefinition | undefined {
  return definitions.get(id);
}

export function getWorkloadComponent(
  id: string,
): LazyExoticComponent<ComponentType> | undefined {
  const definition = definitions.get(id);
  if (!definition) return undefined;
  let component = components.get(id);
  if (!component) {
    component = lazy(definition.load);
    components.set(id, component);
  }
  return component;
}

export function resetRegistry(): void {
  definitions.clear();
  components.clear();
}