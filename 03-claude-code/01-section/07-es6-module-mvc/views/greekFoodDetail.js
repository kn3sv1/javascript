import { layout } from "./layout.js";

export function foodDetailView(food) {
  let content = `
    <a href="/greek-food">← Back to all Greek Food</a>

    <h1>${food.name}</h1>
    <img src="${food.photo}" alt="${food.name}" width="400" />

    <p>${food.description}</p>
    <p><b>Price:</b> $${food.price}</p>
    <p><b>Category:</b> ${food.category}</p>
    <p><b>Calories:</b> ${food.calories} kcal</p>
    <p><b>Rating:</b> ${food.rating} / 5</p>
    <p><b>Discount:</b> ${food.discount_percent}%</p>

    <small>Photo: ${food.photo_credit.author}, ${food.photo_credit.license}</small>
  `;

  return layout({ title: food.name, content });
}
