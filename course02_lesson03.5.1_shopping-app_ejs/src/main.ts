import { calculateSubtotal } from "./cart";
import { applyDiscount } from "./cart";
import { calculateFinalTotal } from "./cart";

const price = 100;
const quantity = 2;
const discount = 10;
const taxRate = 19;
const subtotal = calculateSubtotal(price, quantity);
const discountedTotal = applyDiscount(subtotal, discount);
const finalTotal = calculateFinalTotal(price, quantity, discount, taxRate);

document.querySelector<HTMLParagraphElement>("#price")!.textContent =
  `Price: €${price}`;

document.querySelector<HTMLParagraphElement>("#quantity")!.textContent =
  `Quantity: ${quantity}`;

document.querySelector<HTMLParagraphElement>("#subtotal")!.textContent =
  `€${subtotal}`;

document.querySelector<HTMLParagraphElement>("#discount")!.textContent =
  `Discount: ${discount}%`;

document.querySelector<HTMLParagraphElement>("#discountedTotal")!.textContent =
  `€${discountedTotal}`;

document.querySelector<HTMLParagraphElement>("#taxRate")!.textContent =
  `Tax rate: ${taxRate}%`;

document.querySelector<HTMLParagraphElement>("#total")!.textContent =
  `Total: €${finalTotal}`;
