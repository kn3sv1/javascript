import { layout } from "./layout.js";

export function coffeeView(coffee) {
  let cards = "";

  // Add one card for each coffee in the array
  for (const item of coffee) {
    let popular = "";
    if (item.is_popular) {
      popular = "<p><b>⭐ Popular</b></p>";
    }

    // to empty string card we append each card in for - each
    cards += `
      <div class="card">
        <img src="${item.photo}" alt="${item.name}" />
        <h3>${item.name}</h3>
        ${popular}
        <p>${item.description}</p>
        <p class="price">$${item.price}</p>
        <small>Photo: ${item.photo_credit.author}</small><br />
        <small>Category: ${item.category}</small><br />
        <a href="/coffee/${item.id}">${item.name}</a>
      </div>
    `;
  }

  const content = `
    <style>
      .cards {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
      }
      .card {
        width: 250px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 8px;
      }
      .card img {
        width: 100%;
        height: 180px;
        object-fit: cover;
      }
      .price {
        font-size: 20px;
        font-weight: bold;
      }
    </style>

    <h1>Coffee Catalogue</h1>
    <p>
      <a href="/coffee">All</a> |
      <a href="/coffee?category=espresso">Espresso</a> |
      <a href="/coffee?category=milk">With milk</a> |
      <a href="/coffee?category=dessert">Dessert</a> |
    </p>
    <div class="cards">
      ${cards}
    </div>
  `;

  return layout({ title: "Coffee", content });
}
