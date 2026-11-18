// ===== Home page: last viewed coffee (AJAX) =====

// Run when the HTML is fully parsed
window.addEventListener("DOMContentLoaded", function () {
  loadLastCoffee();
  loadMainDishes();
});

async function loadLastCoffee() {
  const lastCoffeeBox = document.getElementById("last-coffee");

  try {
    // The browser sends the last_coffee cookie automatically
    const response = await fetch("/api/last-coffee");

    // 404 = no cookie yet, or the coffee wasn't found
    if (!response.ok) {
      lastCoffeeBox.innerHTML = `<p>You haven't viewed any coffee yet. <a href="/coffee">Browse coffee</a></p>`;
      return;
    }

    const coffee = await response.json();

    lastCoffeeBox.innerHTML = `
      <h2>👀 Last viewed coffee</h2>
      <div class="card">
        <img src="${coffee.photo}" alt="${coffee.name}" width="250" />
        <h3>${coffee.name}</h3>
        <p>$${coffee.price}</p>
        <a href="/coffee/${coffee.id}">Open again</a>
      </div>
    `;
  } catch (error) {
    // Network error or server down
    lastCoffeeBox.textContent = "Could not load last coffee.";
  }
}

async function loadMainDishes() {
  const mainDishesBox = document.getElementById("main-dishes");

  try {
    const response = await fetch("/api/main-dishes");

    if (!response.ok) {
      mainDishesBox.innerHTML = `<p>No main dishes found yet.</p>`;
      return;
    }

    const mainDishes = await response.json();

    let cards = "";
    for (const dish of mainDishes) {
      cards += `
        <div class="home-food-card">
          <a href="/greek-food/${dish.id}">
            <img src="${dish.photo}" alt="${dish.name}" width="250" />
            <div class="home-food-card-title">${dish.name}</div>
          </a>
        </div>
    `;
    }

    mainDishesBox.innerHTML = `<h2>🍽️ Main dishes</h2><div class="home-food-container">${cards}</div><div style="clear:both"></div>`;
  } catch (error) {
    mainDishesBox.textContent = "Could not load main dishes.";
  }
}
