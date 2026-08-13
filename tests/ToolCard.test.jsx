import { render, screen } from "@testing-library/react";
import ToolCard from "../app/components/ToolCard";

describe("ToolCard", () => {
  it("shows the preparing/loading message in input-streaming state", () => {
    render(
      <ToolCard
        part={{
          type: "tool-estimateTaskEffort",
          state: "input-streaming",
          toolCallId: "tool-1",
        }}
      />
    );

    expect(screen.getByText("Preparing effort estimate…")).toBeInTheDocument();
  });

  it("lists the task titles in input-available state", () => {
    render(
      <ToolCard
        part={{
          type: "tool-estimateTaskEffort",
          state: "input-available",
          toolCallId: "tool-2",
          input: { tasks: ["Write launch note", "Ship a demo"] },
        }}
      />
    );

    expect(
      screen.getByText("Estimating effort for 2 tasks…")
    ).toBeInTheDocument();
    expect(screen.getByText("Write launch note")).toBeInTheDocument();
    expect(screen.getByText("Ship a demo")).toBeInTheDocument();
  });

  it("renders the effort cards in output-available state", () => {
    render(
      <ToolCard
        part={{
          type: "tool-estimateTaskEffort",
          state: "output-available",
          toolCallId: "tool-3",
          output: {
            estimates: [
              {
                title: "Write launch note",
                effortLevel: "medium",
                estimatedMinutes: 45,
              },
            ],
          },
        }}
      />
    );

    expect(screen.getByText("Effort estimate")).toBeInTheDocument();
    expect(screen.getByText("Write launch note")).toBeInTheDocument();
    expect(screen.getByText("medium")).toBeInTheDocument();
    expect(screen.getByText("45 min")).toBeInTheDocument();
  });

  it("renders an alert and the error text in output-error state", () => {
    render(
      <ToolCard
        part={{
          type: "tool-estimateTaskEffort",
          state: "output-error",
          toolCallId: "tool-4",
          errorText: "The estimate failed.",
        }}
      />
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("The estimate failed.")).toBeInTheDocument();
  });
});
