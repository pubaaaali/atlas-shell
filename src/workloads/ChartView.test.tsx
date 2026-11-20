import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ChartView from "./ChartView";

const CSV = [
  "Date,Time,CO_GT,C6H6_GT,NOx_GT,NO2_GT,T,RH,AH,Hour_int,Period",
  "10/03/2004,18.00.00,2.6,11.9,166.0,113.0,13.6,48.9,0.7578,18,Evening Rush",
  "10/03/2004,19.00.00,1.0,9.4,103.0,92.0,13.3,47.7,0.7255,19,Evening Rush",
  "11/03/2004,02.00.00,0.5,2.0,50.0,40.0,8.0,60.0,0.6,2,Night",
].join("\n");

function stubFetch(body: string, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, text: async () => body }),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("ChartView", () => {
  it("draws the daily and hourly charts", async () => {
    stubFetch(CSV);
    render(<ChartView />);
    expect(await screen.findByRole("img", { name: /daily average co/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /average co by hour of day/i })).toBeInTheDocument();
  });

  it("redraws when the measurement changes", async () => {
    stubFetch(CSV);
    const user = userEvent.setup();
    render(<ChartView />);
    await screen.findByRole("img", { name: /daily average co/i });
    await user.selectOptions(screen.getByLabelText(/measurement/i), "temperature");
    expect(
      await screen.findByRole("img", { name: /daily average temperature/i }),
    ).toBeInTheDocument();
  });

  it("reports a load failure", async () => {
    stubFetch("", false);
    render(<ChartView />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/could not load/i);
  });
});