import { calculate, type Operator } from "./calculator";

const leftInput = document.querySelector<HTMLInputElement>("#left")!;
const operatorSelect = document.querySelector<HTMLSelectElement>("#operator")!;
const rightInput = document.querySelector<HTMLInputElement>("#right")!;
const calculateButton = document.querySelector<HTMLButtonElement>("#calculate")!;
const resultDisplay = document.querySelector<HTMLParagraphElement>("#result")!;

function handleCalculate(): void {
  // we debug to see if this was called or not called and how many times.
  // so we can find problem or at least we will see right direction for problem.
  // if I knew how vitest works I would find out problem in 3 second without ChatGPT and Claude code.
  // because I don't have knowledge about vitest I try to guess and chatGPT or Claude code doesn't 
  // understand me or gives me false answer. As result I cannot do work.
  // conclusion is chatGPT and Claude code - help me to learn but I should keep all this information
  // in my head and from each project learn a lot of valuable knowledge.
  console.log("handleCalculate called at:" + new Date().toISOString());

  const left = Number(leftInput.value);
  const right = Number(rightInput.value);
  // without "as Operator" type will be just string and other functions that accept Operator type
  // will complain and my program will not compile. Operator is restriction enum 
  // from possible string: "+" | "-" | "*" | "/"; - NOT ANY STRING!
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
