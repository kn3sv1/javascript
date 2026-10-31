import { layout } from "./layout.js";

export function coffeeDetailView(coffee) {
  let content = `
    <a href="/coffee">← Back to all coffee</a>

    <h1>${coffee.name}</h1>
    <img src="${coffee.photo}" alt="${coffee.name}" width="400" />

    <p>${coffee.description}</p>
    <p><b>Price:</b> $${coffee.price}</p>
    <p><b>Category:</b> ${coffee.category}</p>
    <p><b>Size:</b> ${coffee.size_ml} ml</p>
    <p><b>Caffeine:</b> ${coffee.caffeine_mg} mg</p>
    <p><b>Calories:</b> ${coffee.calories} kcal</p>
    <p><b>Rating:</b> ${coffee.rating} / 5</p>

    <small>Photo: ${coffee.photo_credit.author}, ${coffee.photo_credit.license}</small>
  `;

  return layout({ title: coffee.name, content });
}
