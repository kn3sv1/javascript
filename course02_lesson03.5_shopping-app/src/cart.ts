export function calculateSubtotal(price: number, quantity: number): number {
  return price * quantity;
}

export function applyDiscount(total: number, discountPercent: number): number {
  return total - total * (discountPercent / 100);
}

export function calculateTax(total: number, taxRate: number): number {
  return total * (taxRate / 100);
}

export function calculateFinalTotal(
  price: number,
  quantity: number,
  discountPercent: number,
  taxRate: number,
): number {
  const subtotal = calculateSubtotal(price, quantity);

  const discountedTotal = applyDiscount(subtotal, discountPercent);

  const tax = calculateTax(discountedTotal, taxRate);

  return discountedTotal + tax;
}
