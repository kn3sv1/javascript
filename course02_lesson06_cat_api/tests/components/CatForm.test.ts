import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/dom";
import { CatForm } from "../../src/components/CatForm";

describe("CatForm", () => {
  it("submits cat", async () => {
    const submit = vi.fn();

    document.body.appendChild(CatForm(submit));

    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("Name"), "Tom");
    await user.type(screen.getByPlaceholderText("Age"), "4");
    await user.type(screen.getByPlaceholderText("City"), "Limassol");
    await user.type(screen.getByPlaceholderText("Photo"), "/123.png");

    await user.click(screen.getByText("Add Cat"));

    // we don't compare exactly id that was called because it was generated dynamically.
    // I just check that it matches regular expression.
    // Or check if it matches any string.

    expect(submit).toHaveBeenCalledWith({
      //   id: expect.stringMatching(
      //     /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      //   ),
      id: expect.any(String),
      name: "Tom",
      age: 4,
      city: "Limassol",
      photo: "/123.png",
    });
  });
});
