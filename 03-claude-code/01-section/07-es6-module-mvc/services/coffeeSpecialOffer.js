
// never use async here
export function getCoffeeWithSpecialOffer(coffee) {
  const updatedCoffees = coffee.map((coffee) => ({
    ...coffee,
    special_offer: coffee.discount_percent >= 5,
  }));

  return updatedCoffees;
}
