import "./style.css";


const input = document.querySelector<HTMLInputElement>("#input-example");
if (input) {
  input.value = "Roma";
  console.log(input?.value);
}

const button = document.querySelector<HTMLButtonElement>("#button-example");
if (button) {
  button.disabled = true;
  button.click();
}

const div = document.querySelector<HTMLDivElement>("#div-example");
if (div) {
  div.innerHTML = "<h1>Hello</h1>";
  div.append("New text");
}
