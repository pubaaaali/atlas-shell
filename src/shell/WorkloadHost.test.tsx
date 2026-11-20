import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { registerWorkload, resetRegistry } from "./registry";
import WorkloadHost from "./WorkloadHost";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/workloads/:id" element={<WorkloadHost />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("WorkloadHost", () => {
  beforeEach(() => {
    resetRegistry();
    registerWorkload({
      id: "demo",
      title: "Demo",
      description: "Demo workload",
      icon: "🧪",
      load: async () => ({ default: () => <p>Demo loaded</p> }),
    });
  });

  it("lazy loads the requested workload", async () => {
    renderAt("/workloads/demo");
    expect(await screen.findByText("Demo loaded")).toBeInTheDocument();
  });

  it("shows a message for an unknown workload", () => {
    renderAt("/workloads/missing");
    expect(screen.getByRole("alert")).toHaveTextContent(/not found/i);
  });
});