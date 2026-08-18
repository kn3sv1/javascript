import { calculateSubtotal } from "./cart";

const price = 10;
const quantity = 3;

const total = calculateSubtotal(price, quantity);

document.querySelector<HTMLParagraphElement>("#result")!.textContent =
  `Total: €${total}`;
