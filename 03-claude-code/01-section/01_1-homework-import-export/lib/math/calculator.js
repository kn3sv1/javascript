// Namespace import: everything exported from operations.js
// is collected into one object called "operations".
//   operations.add(1, 2), operations.multiply(3, 4), ...
import * as operations from "./operations.js";
import { OPERATIONS, CALCULATION_DELAY_MS } from "../constants.js";

// Turns setTimeout (callback style) into a Promise, so we can "await" it.
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// "async" functions always return a Promise.
// Imagine this calls a slow service or database - the caller has to await it.
export async function calculate(a, b, op) {
  if (!OPERATIONS[op]) {
    throw new Error(`Unknown operation: "${op}".`);
  }
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new Error("Both values must be numbers.");
  }

  await delay(CALCULATION_DELAY_MS);

  // operations["add"] is the add function, operations["divide"] is divide, ...
  const result = operations[op](a, b);
  return { a, b, op, result };
}

// Runs ALL operations at the same time with Promise.all.
// 6 operations x 300ms each still takes ~300ms total, not 1800ms.
// Promise.allSettled is used so one error (divide by zero) does not fail the rest.
export async function calculateAll(a, b) {
  const ops = Object.keys(OPERATIONS);
  const outcomes = await Promise.allSettled(ops.map((op) => calculate(a, b, op)));

  return outcomes.map((outcome, i) =>
    outcome.status === "fulfilled"
      ? outcome.value
      : { a, b, op: ops[i], error: outcome.reason.message },
  );
}
