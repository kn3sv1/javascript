import { describe, expect, it, vi } from "vitest";
import { HomeView } from "../../src/views/HomeView";

describe("HomeView", () => {
  it("renders the form and the list", () => {
    const onCreate = vi.fn();
    const onDelete = vi.fn();

    const view = HomeView(
      [
        {
          id: "1",
          name: "Tom",
          age: 4,
          city: "Limassol",
          photo: "/123.png",
        },
      ],
      onCreate,
      onDelete
    );

    expect(view.children).toHaveLength(2);
    expect(view.querySelector("form")).not.toBeNull();
    expect(view.querySelector("ul")).not.toBeNull();
  });
});