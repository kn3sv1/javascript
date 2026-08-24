import { describe, expect, it } from "vitest";
import { calculate } from "../src/calculator";

describe("calculate", () => {
  it("adds two numbers", () => {
    expect(calculate(2, "+", 3)).toBe(5);
  });

  it("subtracts two numbers", () => {
    expect(calculate(5, "-", 3)).toBe(2);
  });

  it("multiplies two numbers", () => {
    expect(calculate(4, "*", 3)).toBe(12);
  });

  it("divides two numbers", () => {
    expect(calculate(9, "/", 3)).toBe(3);
  });

  it("returns Infinity when dividing by zero", () => {
    expect(calculate(9, "/", 0)).toBe(Infinity);
  });

  it("handles negative numbers", () => {
    expect(calculate(-2, "+", -3)).toBe(-5);
  });
});
