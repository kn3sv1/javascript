import { test } from "node:test";
import assert from "node:assert/strict";

// some() asks one question about an array:
// "Is there AT LEAST ONE item that passes the check?"
// The answer is always true or false.

// our check: is this cell not empty?
function isNotEmpty(cell) {
  return cell !== "";
}

test("some: row with text", () => {
  const row = ["2023", "Skye"];
  const result = row.some(isNotEmpty);

  console.log("\n", row, "→", result);
  assert.equal(result, true);
});

test("some: one cell with text is enough", () => {
  const row = ["", "Skye", ""];
  const result = row.some(isNotEmpty);

  console.log("\n", row, "→", result);
  assert.equal(result, true);
});

test("some: all cells empty", () => {
  const row = ["", "", ""];
  const result = row.some(isNotEmpty);

  console.log("\n", row, "→", result);
  assert.equal(result, false);
});

test("some: short arrow version does the same", () => {
  const row = ["", "Skye", ""];

  // same as row.some(isNotEmpty), but the check is written inline
  const result = row.some((cell) => cell !== "");

  assert.equal(result, true);
});
