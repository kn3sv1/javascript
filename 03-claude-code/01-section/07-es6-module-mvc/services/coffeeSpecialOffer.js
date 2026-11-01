// never use async here
export function getCoffeeWithSpecialOffer(coffees) {
  const updatedCoffees = coffees.map((coffee) => ({
    ...coffee,
    special_offer: coffee.discount_percent >= 5,
  }));

  return updatedCoffees;
}

export function getCoffeeOnlyWithSpecialOffer(coffees) {
  const updatedCoffees = [];
  coffees.forEach((coffee) => {
    const specialOffer = coffee.discount_percent > 5;
    if (specialOffer) {
      updatedCoffees.push({
        ...coffee,
        special_offer: specialOffer,
      });
    }
  });

  return updatedCoffees;
}
