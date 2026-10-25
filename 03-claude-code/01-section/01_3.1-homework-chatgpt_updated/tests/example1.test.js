import { test } from "node:test";
import assert from "node:assert/strict";


function add(a, b) {
  return a + b;
}


test("calculator: add", () => {
  console.log("\nadd two numbers 1 + 3");
  const result = add(1, 3);

  assert.equal(result, 4);
});
