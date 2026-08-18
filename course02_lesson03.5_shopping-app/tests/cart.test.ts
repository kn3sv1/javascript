import { describe, it, expect } from "vitest";
import { calculateSubtotal } from "../src/cart";
import { applyDiscount } from "../src/cart";
import { calculateTax } from "../src/cart";
import { calculateFinalTotal } from "../src/cart";

describe("calculateSubtotal", () => {
  it("calculates the total price", () => {
    const result = calculateSubtotal(10, 3);

    expect(result).toBe(30);
  });

  it("works with quantity of 1", () => {
    const result = calculateSubtotal(20, 1);

    expect(result).toBe(20);
  });

  it("returns 0 when quantity is 0", () => {
    const result = calculateSubtotal(20, 0);

    expect(result).toBe(0);
  });
});

describe("applyDiscount", () => {
  it("applies a 20% discount", () => {
    expect(applyDiscount(100, 20)).toBe(80);
  });
});

describe("calculateTax", () => {
  it("calculates the tax rate", () => {
    expect(calculateTax(2000, 19)).toBe(380);
  });
});

describe("calculateFinalTotal", () => {
  it("calculates total without discount and tax", () => {
    const result = calculateFinalTotal(100, 2, 0, 0);
    expect(result).toBe(200);
  });

  it("calculates total with discount", () => {
    const result = calculateFinalTotal(100, 2, 10, 0);
    expect(result).toBe(180);
  });

  it("calculates total with tax", () => {
    const result = calculateFinalTotal(100, 2, 0, 20);
    expect(result).toBe(240);
  });

  it("calculates total with both discount and tax", () => {
    const result = calculateFinalTotal(100, 2, 10, 20);
    expect(result).toBe(216);
  });

  it("returns zero when quantity is zero", () => {
    const result = calculateFinalTotal(100, 0, 10, 20);
    expect(result).toBe(0);
  });
  
});
