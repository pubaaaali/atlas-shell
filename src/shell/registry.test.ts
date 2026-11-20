import { beforeEach, describe, expect, it } from "vitest";
import {
  getWorkloadComponent,
  getWorkloads,
  registerWorkload,
  resetRegistry,
} from "./registry";
import type { WorkloadDefinition } from "./types";

const sample = (id: string): WorkloadDefinition => ({
  id,
  title: id,
  description: "Test workload",
  icon: "📊",
  load: async () => ({ default: () => null }),
});

describe("workload registry", () => {
  beforeEach(() => resetRegistry());

  it("lists registered workloads", () => {
    registerWorkload(sample("explorer"));
    expect(getWorkloads().map((w) => w.id)).toEqual(["explorer"]);
  });

  it("rejects duplicate ids", () => {
    registerWorkload(sample("explorer"));
    expect(() => registerWorkload(sample("explorer"))).toThrow(/already registered/);
  });

  it("returns the same lazy component on repeated calls", () => {
    registerWorkload(sample("explorer"));
    expect(getWorkloadComponent("explorer")).toBe(getWorkloadComponent("explorer"));
  });
});