import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Tasks from "../app/tasks/page";

describe("Tasks page", () => {
  it("renders the input and Add button", () => {
    render(<Tasks />);

    expect(
      screen.getByRole("textbox", { name: /add a task/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^add$/i })).toBeInTheDocument();
  });

  it("adds a task to the list on typing + clicking Add, and clears the input after", async () => {
    const user = userEvent.setup();
    render(<Tasks />);

    const input = screen.getByPlaceholderText("Add a task");
    await user.type(input, "Buy groceries");
    await user.click(screen.getByRole("button", { name: /^add$/i }));

    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("does not add a task when the input is empty", async () => {
    const user = userEvent.setup();
    render(<Tasks />);

    const input = screen.getByRole("textbox", { name: /add a task/i });
    await user.type(input, "   ");
    await user.click(screen.getByRole("button", { name: /^add$/i }));

    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("toggles a checkmark prefix on a task when its text is clicked", async () => {
    const user = userEvent.setup();
    render(<Tasks />);

    const input = screen.getByRole("textbox", { name: /add a task/i });
    await user.type(input, "Read book");
    await user.click(screen.getByRole("button", { name: /^add$/i }));
    await user.click(screen.getByText("Read book"));

    expect(screen.getByText("✔ Read book")).toBeInTheDocument();
  });

  it("removes a task when its Delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<Tasks />);

    const input = screen.getByRole("textbox", { name: /add a task/i });
    await user.type(input, "Write article");
    await user.click(screen.getByRole("button", { name: /^add$/i }));
    await user.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(screen.queryByText("Write article")).not.toBeInTheDocument();
  });
});
