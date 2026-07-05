import { describe, expect, it, vi } from "vitest";
import { CatsService } from "../../src/services/cats.service";
import { HomePage } from "../../src/pages/HomePage";

vi.mock("../../src/services/cats.service");

describe("HomePage", () => {
  it("loads cats", async () => {
    vi.mocked(CatsService.getAll).mockResolvedValue([
      {
        id: "019f3242-86b5-7b51-a707-331640d3bed0",
        name: "Tom",
        age: 4,
        city: "Limassol",
        photo: "/123.png",
      },
    ]);

    const page = new HomePage();

    await page.render(document.body);

    expect(CatsService.getAll).toHaveBeenCalledTimes(2);
  });
});
