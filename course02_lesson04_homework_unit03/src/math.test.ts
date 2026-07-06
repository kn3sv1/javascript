import { describe, it, expect } from "vitest";
import { add } from "./math";

describe("add", () => {
  it("adds two positive numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("adds negative numbers", () => {
    expect(add(-1, -2)).toBe(-3);
  });

  it("adds zero", () => {
    expect(add(5, 0)).toBe(5);
  });
});
