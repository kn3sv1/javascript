import { describe, it, expect } from "vitest";
import { Calculator } from "../src/Calculator";

describe("CalculatorService", () => {
  it("adds numbers", () => {
    let a: number = 5;
    let b: number = 2;
    let result = Calculator.add(a, b);

    expect(result).toBe(7);
  });
});

describe("CalculatorService", () => {
  it("subtract numbers", () => {
    let a: number = 5;
    let b: number = 2;
    let result = Calculator.subtract(a, b);
    expect(a - b).toBe(result);
  });
});
