// never use async here
export function getFoodWithSpecialOffer(food) {
  const UpdatedFood = food.map((food) => ({
    ...food,
    special_offer: food.discount_percent >= 5,
  }));

  return UpdatedFood;
}

export function getFoodWithOverTenPercent(food) {
  const UpdatedFood = food.map((food) => ({
    ...food,
    discount_percent_over_10: food.discount_percent > 10,
  }));

  return UpdatedFood;
}

export function getFoodOnlyWithSpecialOffer(food) {
  const UpdatedFood = [];
  food.forEach((food) => {
    const specialOffer = food.discount_percent >= 5;
    if (specialOffer) {
      UpdatedFood.push({
        ...food,
        special_offer: specialOffer,
      });
    }
  });

  return UpdatedFood;
}
