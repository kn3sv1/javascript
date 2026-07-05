import { describe, expect, it, vi } from "vitest";
import { CatsService } from "../../src/services/cats.service";

describe("CatsService", () => {
  it("loads cats", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: "019f3242-86b5-7b51-a707-331640d3bed0",
            name: "Tom",
            age: 4,
            city: "Limassol",
            photo: "/123.png",
          },
        ]),
    } as Response);

    const cats = await CatsService.getAll();

    expect(cats).toHaveLength(1);
    expect(fetch).toHaveBeenCalled();
  });
});
