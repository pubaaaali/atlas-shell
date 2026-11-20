import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import Home from "./Home";
import { registerWorkload, resetRegistry } from "./registry";

describe("Home", () => {
  beforeEach(() => {
    resetRegistry();
    registerWorkload({
      id: "explorer",
      title: "Data Explorer",
      description: "Browse tables",
      icon: "📊",
      load: async () => ({ default: () => null }),
    });
  });

  it("shows a tile that links to each workload", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    const tile = screen.getByRole("link", { name: /data explorer/i });
    expect(tile).toHaveAttribute("href", "/workloads/explorer");
  });
});