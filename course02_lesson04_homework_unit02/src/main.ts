import "./style.css";
import { add } from "./math";

const button = document.querySelector<HTMLButtonElement>("#btn");
const message = document.querySelector<HTMLParagraphElement>("#message");

button?.addEventListener("click", () => {
  if (message) {
    message.textContent = "Hello from Vite + TypeScript!";
  }
});

console.log(add(5, 7)); // 12


interface User {
  name: string;
  age: number;
}

const user: User = {
  name: "Alice",
  age: 25,
};

console.log(user.name);
