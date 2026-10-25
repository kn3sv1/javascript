import { test } from "node:test";
import assert from "node:assert/strict";

// always get an array, even if the form sent only one value (a string)
const toArray = (value) => [].concat(value || []).map((v) => v.trim());

test("rows: map row0..row2 into arrays, then drop empty rows", () => {
  // emulated formData - what querystring.parse() gives for the form
  const formData = {
    row0: ["2023", "Skye ", "5", "⭐⭐⭐⭐"],
    row1: ["", "", "", ""], // empty row in the middle
    row2: ["2025", "Kenya", "7", "⭐⭐⭐⭐⭐"],
  };

  const rowIndexes = [0, 1, 2];
  const mappedRows = rowIndexes.map((r) => toArray(formData[`row${r}`]));
  const rows = mappedRows.filter((row) => row.some((cell) => cell !== ""));

  console.log("\nmappedRows:", mappedRows);
  console.log("rows:", rows);

  // after map: still 3 rows, cells are trimmed ("Skye " → "Skye")
  assert.deepEqual(mappedRows, [
    ["2023", "Skye", "5", "⭐⭐⭐⭐"],
    ["", "", "", ""],
    ["2025", "Kenya", "7", "⭐⭐⭐⭐⭐"],
  ]);

  // after filter: the empty row is gone
  assert.deepEqual(rows, [
    ["2023", "Skye", "5", "⭐⭐⭐⭐"],
    ["2025", "Kenya", "7", "⭐⭐⭐⭐⭐"],
  ]);
});

test("rows: a missing row or a row with only spaces is dropped", () => {
  const formData = {
    row0: ["2023", "Skye", "5", "⭐⭐⭐⭐"],
    row1: ["  ", " ", "", ""], // only spaces - trim() makes them ""
    // row2 is missing - toArray(undefined) gives []
  };

  const rowIndexes = [0, 1, 2];
  const mappedRows = rowIndexes.map((r) => toArray(formData[`row${r}`]));
  const rows = mappedRows.filter((row) => row.some((cell) => cell !== ""));

  assert.deepEqual(mappedRows, [
    ["2023", "Skye", "5", "⭐⭐⭐⭐"],
    ["", "", "", ""],
    [],
  ]);
  assert.deepEqual(rows, [["2023", "Skye", "5", "⭐⭐⭐⭐"]]);
});
