// Pure math functions. No HTTP, no HTML, no files - just numbers in, number out.
// Keeping logic like this separate makes it easy to reuse and test.

// Named exports: imported with curly braces
//   import { add, subtract } from "./operations.js";
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export function multiply(a, b) {
  return a * b;
}

export function divide(a, b) {
  if (b === 0) {
    throw new Error("Cannot divide by zero.");
  }
  return a / b;
}

export function power(a, b) {
  return a ** b;
}

// Declared first, exported later under a different name ("export ... as").
function remainder(a, b) {
  if (b === 0) {
    throw new Error("Cannot take modulo by zero.");
  }
  return a % b;
}

export { remainder as modulo };
