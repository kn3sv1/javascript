import { layout } from "./layout.js";

export function coffeeView(coffee, visits, lastVisit) {
  let cards = "";

  // Text about the visits
  let visitInfo = `You have visited this page <b>${visits}</b> times.`;
  if (lastVisit) {
    visitInfo += ` Your last visit: <b>${lastVisit}</b>`;
  } else {
    visitInfo = "👋 Welcome! This is your first visit.";
  }

  // 1. Keep only the discounts above 0: [10, 15, 20, 10, 5]
  const discounts = coffee
    .map((item) => item.discount_percent)
    .filter((d) => d > 0);

  // 2. Find the smallest one: 5
  const lowestDiscount = Math.min(...discounts);

  // 3. Find the biggest one: 20
  const highestDiscount = Math.max(...discounts);

  // Add one card for each coffee in the array
  for (const item of coffee) {
    let popular = "";
    let lowestBadge = "";

    if (item.is_popular) {
      popular = "<p><b>⭐ Popular</b></p>";
    }

    if (item.discount_percent === lowestDiscount) {
      lowestBadge = "<p><b>🏷️ Smallest deal</b></p>";
    }

    let highestBadge = "";
    if (item.discount_percent === highestDiscount) {
      highestBadge = `<p class="best-deal">🔥 Best deal -${item.discount_percent}%</p>`;
    }

    let specialOffer = "";
    if (item.discount_percent_over_10) {
      specialOffer = " discount_percent_over_10"; // green
    } else if (item.special_offer) {
      specialOffer = " special-offer"; // yellow
    }

    // to empty string card we append each card in for - each
    cards += `
      <div class="card ${specialOffer}">
        <img src="${item.photo}" alt="${item.name}" />
        ${highestBadge}
        <h3>${item.name}</h3>
        ${popular} ${lowestBadge}
        <p>${item.description}</p>
        <p class="price">$${item.price}</p>
        <small>Discount:${item.discount_percent}%</small><br />
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
      .special-offer {
        background-color: #f8f67d;
      }
      .discount_percent_over_10 {
        background-color: #aeeb34;
      }
      .best-deal {
        display: inline-block;
        margin: 8px 0 0;
        padding: 6px 14px;
        background-color: #e53935;
        color: white;
        font-weight: bold;
        font-size: 16px;
        border-radius: 20px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      }
      .visits {
        color: #777;
        font-size: 14px;
      }
    </style>

    <h1>Coffee Catalogue</h1>
    <p class="visits">${visitInfo}</p>
    <p>
      <a href="/coffee">All</a> |
      <a href="/coffee?category=espresso">Espresso</a> |
      <a href="/coffee?category=milk">With milk</a> |
      <a href="/coffee?category=dessert">Dessert</a> |
      <a href="/coffee?special_offer=1">Special Offers</a>
    </p>
    <div class="cards">
      ${cards}
    </div>
  `;

  return layout({ title: "Coffee", content });
}
