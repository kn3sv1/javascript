import { calculate, type Operator } from "./calculator";

const leftInput = document.querySelector<HTMLInputElement>("#left")!;
const operatorSelect = document.querySelector<HTMLSelectElement>("#operator")!;
const rightInput = document.querySelector<HTMLInputElement>("#right")!;
const calculateButton = document.querySelector<HTMLButtonElement>("#calculate")!;
const resultDisplay = document.querySelector<HTMLParagraphElement>("#result")!;

function handleCalculate(): void {
  const left = Number(leftInput.value);
  const right = Number(rightInput.value);
  const operator = operatorSelect.value as Operator;

  if (Number.isNaN(left) || Number.isNaN(right)) {
    resultDisplay.textContent = "Please enter valid numbers.";
    return;
  }

  if (operator === "/" && right === 0) {
    resultDisplay.textContent = "Cannot divide by zero.";
    return;
  }

  const result = calculate(left, operator, right);
  resultDisplay.textContent = `Result: ${result}`;
}

calculateButton.addEventListener("click", handleCalculate);
