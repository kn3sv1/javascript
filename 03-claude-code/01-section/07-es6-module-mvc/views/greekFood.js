import { layout } from "./layout.js";

export function greekFoodView(food) {
  let cards = "";

  // Add one card for each coffee in the array
  for (const item of food) {
    let popular = "";
    if (item.is_popular) {
      popular = "<p><b>⭐ Popular</b></p>";
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
        <h3>${item.name}</h3>
        ${popular}
        <p>${item.description}</p>
        <p class="price">$${item.price}</p>
        <small>Discount:${item.discount_percent}%</small><br />
        <small>Photo: ${item.photo_credit.author}</small><br />
        <small>Category: ${item.category}</small><br />
        <a href="/greek-food/${item.id}">${item.name}</a>
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
    </style>

    <h1>Greek Food Catalogue</h1>
    <p>
      <a href="/greek-food">All</a> |
      <a href="/greek-food?category=main">Main Dishes</a> |
      <a href="/greek-food?category=street food">Street Food</a> |
      <a href="/greek-food?category=soup">Soups</a> |
      <a href="/greek-food?category=salad">Salad</a> |
      <a href="/greek-food?category=appetizer">Appetizers</a> |
      <a href="/greek-food?category=pastry">Pastry</a> |
      <a href="/greek-food?category=dessert">Dessert</a> |
      <a href="/greek-food?special_offer=1">Special Offers</a>
    </p>
    <div class="cards">
      ${cards}
    </div>
  `;

  return layout({ title: "Greek Food", content });
}
