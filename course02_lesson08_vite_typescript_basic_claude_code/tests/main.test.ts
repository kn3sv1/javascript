// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

function renderCalculatorHtml(): void {
  document.body.innerHTML = `
    <input id="left" type="number" value="0" />
    <select id="operator">
      <option value="+">+</option>
      <option value="-">-</option>
      <option value="*">*</option>
      <option value="/">/</option>
    </select>
    <input id="right" type="number" value="0" />
    <button id="calculate">Calculate</button>
    <p id="result"></p>
  `;
}

async function loadMain(): Promise<void> {
  await import("../src/main");
}

function setValue(id: string, value: string): void {
  const element = document.getElementById(id) as HTMLInputElement | HTMLSelectElement;
  element.value = value;
}

function resultText(): string | null {
  return document.getElementById("result")!.textContent;
}

describe("main (DOM wiring)", () => {
  beforeEach(() => {
    vi.resetModules();
    renderCalculatorHtml();
  });

  it("shows the result when Calculate is clicked", async () => {
    await loadMain();
    setValue("left", "4");
    setValue("right", "5");
    setValue("operator", "+");

    document.getElementById("calculate")!.click();

    expect(resultText()).toBe("Result: 9");
  });

  it("shows an error when dividing by zero", async () => {
    await loadMain();
    setValue("left", "10");
    setValue("right", "0");
    setValue("operator", "/");

    document.getElementById("calculate")!.click();

    expect(resultText()).toBe("Cannot divide by zero.");
  });

  it("shows an error for invalid numbers", async () => {
    // <input type="number"> sanitizes bad input to "", so use a text
    // input here to exercise the NaN guard in handleCalculate.
    document.getElementById("left")!.setAttribute("type", "text");
    await loadMain();
    setValue("left", "not-a-number");
    setValue("right", "5");

    document.getElementById("calculate")!.click();

    expect(resultText()).toBe("Please enter valid numbers.");
  });
});
