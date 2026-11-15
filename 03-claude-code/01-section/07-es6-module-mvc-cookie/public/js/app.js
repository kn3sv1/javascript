// ===== Nav: highlight current page =====
for (const link of document.querySelectorAll("nav a")) {
  if (link.getAttribute("href") === window.location.pathname) {
    link.style.fontWeight = "bold";
    link.style.color = "#c4a688";
  }
}

// ===== Footer: live clock =====
function updateClock() {
  document.getElementById("clock").textContent =
    new Date().toLocaleTimeString();
}

// Display time immediately
updateClock();

// Update every second
setInterval(updateClock, 1000);

// ===== Header: dark mode button =====
/*const themeButton = document.getElementById("theme-btn");

themeButton.addEventListener("click", () => {
  // Add the "dark" class if it's missing, remove it if it's there
  document.body.classList.toggle("dark");

  // Change the button text
  if (document.body.classList.contains("dark")) {
    themeButton.textContent = "☀️ Light mode";
  } else {
    themeButton.textContent = "🌙 Dark mode";
  }
});*/

const themeButton = document.getElementById("theme-btn");

// Load saved theme when the page opens
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeButton.textContent = "☀️ Light mode";
}

// Switch theme when the button is clicked
themeButton.addEventListener("click", function () {

  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeButton.textContent = "☀️ Light mode";
    localStorage.setItem("theme", "dark");
  } else {
    themeButton.textContent = "🌙 Dark mode";
    localStorage.setItem("theme", "light");
  }

});

// ===== Coffee page: best deal popup =====
