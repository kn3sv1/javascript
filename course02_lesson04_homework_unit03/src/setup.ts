import { add } from "./math";

export function setup() {
  const button = document.getElementById("add")!;
  const result = document.getElementById("result")!;

  button.addEventListener("click", () => {
    const a = Number((document.getElementById("a") as HTMLInputElement).value);
    const b = Number((document.getElementById("b") as HTMLInputElement).value);

    result.textContent = add(a, b).toString();
  });
}
