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

// ===== Coffee page: best deal popup =====
