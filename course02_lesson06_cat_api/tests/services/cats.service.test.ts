import { beforeEach, describe, expect, it, vi } from "vitest";
import { CatsService } from "../../src/services/cats.service";
import { request } from "../../src/services/api";

vi.mock("../../src/services/api", () => ({
  request: vi.fn(),
}));

describe("CatsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAll calls request", async () => {
    vi.mocked(request).mockResolvedValue([]);

    await CatsService.getAll();

    expect(request).toHaveBeenCalledWith("/cats");
  });

  it("get calls request", async () => {
    vi.mocked(request).mockResolvedValue({} as never);

    await CatsService.get("123");

    expect(request).toHaveBeenCalledWith("/cats/123");
  });

  it("create sends POST request", async () => {
    const cat = {
      id: "1",
      name: "Tom",
      age: 4,
      city: "Limassol",
      photo: "/123.png",
    };

    vi.mocked(request).mockResolvedValue(cat);

    await CatsService.create(cat);

    expect(request).toHaveBeenCalledWith("/cats", {
      method: "POST",
      body: JSON.stringify(cat),
    });
  });

  it("update sends PUT request", async () => {
    const cat = {
      id: "1",
      name: "Tom",
      age: 4,
      city: "Limassol",
      photo: "/123.png",
    };

    vi.mocked(request).mockResolvedValue(cat);

    await CatsService.update("1", cat);

    expect(request).toHaveBeenCalledWith("/cats/1", {
      method: "PUT",
      body: JSON.stringify(cat),
    });
  });

  it("delete sends DELETE request", async () => {
    vi.mocked(request).mockResolvedValue(undefined);

    await CatsService.delete("1");

    expect(request).toHaveBeenCalledWith("/cats/1", {
      method: "DELETE",
    });
  });
});
