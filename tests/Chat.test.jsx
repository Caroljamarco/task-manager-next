import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { useChat } from "@ai-sdk/react";
import Chat from "../app/components/Chat";

vi.mock("@ai-sdk/react", () => ({
  useChat: vi.fn(),
}));

describe("Chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders example prompt buttons in the empty state", () => {
    useChat.mockReturnValue({
      messages: [],
      sendMessage: vi.fn(),
      status: "ready",
      stop: vi.fn(),
      error: undefined,
      regenerate: vi.fn(),
    });

    render(<Chat />);

    expect(
      screen.getByRole("button", { name: "Plan a weekend trip" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Launch a small side project" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Organize a home office" })
    ).toBeInTheDocument();
  });

  it("disables the input while status is submitted", () => {
    useChat.mockReturnValue({
      messages: [],
      sendMessage: vi.fn(),
      status: "submitted",
      stop: vi.fn(),
      error: undefined,
      regenerate: vi.fn(),
    });

    render(<Chat />);

    expect(screen.getByPlaceholderText("Type a message...")).toBeDisabled();
  });

  it("renders the Stop button while status is streaming", () => {
    useChat.mockReturnValue({
      messages: [],
      sendMessage: vi.fn(),
      status: "streaming",
      stop: vi.fn(),
      error: undefined,
      regenerate: vi.fn(),
    });

    render(<Chat />);

    expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument();
  });

  it("renders an error banner with a Retry button and calls regenerate on click", async () => {
    const user = userEvent.setup();
    const regenerate = vi.fn().mockResolvedValue(undefined);

    useChat.mockReturnValue({
      messages: [],
      sendMessage: vi.fn(),
      status: "ready",
      stop: vi.fn(),
      error: new Error("Something went wrong"),
      regenerate,
    });

    render(<Chat />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() => expect(regenerate).toHaveBeenCalledTimes(1));
  });

  it("renders a tool-result part inline inside a message", () => {
    useChat.mockReturnValue({
      messages: [
        {
          id: "message-1",
          role: "assistant",
          parts: [
            {
              type: "tool-estimateTaskEffort",
              state: "output-available",
              toolCallId: "tool-1",
              output: {
                estimates: [
                  {
                    title: "Write launch note",
                    effortLevel: "medium",
                    estimatedMinutes: 45,
                  },
                ],
              },
            },
          ],
        },
      ],
      sendMessage: vi.fn(),
      status: "ready",
      stop: vi.fn(),
      error: undefined,
      regenerate: vi.fn(),
    });

    render(<Chat />);

    expect(screen.getByText("Effort estimate")).toBeInTheDocument();
    expect(screen.getByText("Write launch note")).toBeInTheDocument();
  });
});
