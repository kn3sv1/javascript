import { describe, it, expect, beforeEach } from "vitest";
import { setup } from "./setup";

describe("Addition UI", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="a" value="2">
      <input id="b" value="3">
      <button id="add">Add</button>
      <p id="result"></p>
    `;

    setup();
  });

  it("shows the correct sum when the button is clicked", () => {
    document.getElementById("add")!.click();

    expect(document.getElementById("result")!.textContent).toBe("5");
  });
});
