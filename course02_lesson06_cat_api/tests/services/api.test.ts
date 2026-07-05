import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { request } from "../../src/services/api";

describe("request", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns response JSON", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    } as Response);

    const result = await request("cats");

    expect(result).toEqual({ id: 1 });
  });

  it("calls fetch with the correct URL and headers", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    await request("cats");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/cats"),
      expect.objectContaining({
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  });

  it("merges request options", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    await request("cats", {
      method: "POST",
      body: JSON.stringify({ name: "Tom" }),
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Tom" }),
      })
    );
  });

  it("throws an error when the response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      text: () => Promise.resolve("Something went wrong"),
    } as Response);

    await expect(request("cats")).rejects.toThrow("Something went wrong");
  });
});
