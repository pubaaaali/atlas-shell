import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getWorkload, getWorkloads, registerWorkload, resetRegistry } from "../shell/registry";
import { registerManifestPlugins } from "./registerManifestPlugins";

const manifest = {
  plugins: [
    {
      id: "co-summary",
      title: "CO Summary",
      description: "Min, max and average CO.",
      icon: "🧪",
      kind: "summary",
      metric: "co",
    },
  ],
};

function stubManifest(body: unknown, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 404, json: async () => body }),
  );
}

describe("registerManifestPlugins", () => {
  beforeEach(() => resetRegistry());
  afterEach(() => {
    vi.unstubAllGlobals();
    resetRegistry();
  });

  it("registers plugins declared in the manifest", async () => {
    stubManifest(manifest);
    const skipped = await registerManifestPlugins("/plugins/manifest.json");
    expect(skipped).toEqual([]);
    expect(getWorkloads().map((w) => w.id)).toEqual(["co-summary"]);
  });

  it("never replaces a workload that is already registered", async () => {
    registerWorkload({
      id: "co-summary",
      title: "Built in",
      description: "Existing",
      icon: "📊",
      load: async () => ({ default: () => null }),
    });
    stubManifest(manifest);
    const skipped = await registerManifestPlugins("/plugins/manifest.json");
    expect(skipped).toHaveLength(1);
    expect(getWorkload("co-summary")?.title).toBe("Built in");
  });

  it("rejects when the manifest cannot be fetched", async () => {
    stubManifest({}, false);
    await expect(registerManifestPlugins("/plugins/manifest.json")).rejects.toThrow(/404/);
  });
});