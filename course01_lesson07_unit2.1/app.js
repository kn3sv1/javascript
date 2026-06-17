document.addEventListener("click", (e) => {
  if (e.target.matches(".open-modal-btn")) {
    openModal();
  }

  if (e.target.matches(".close-modal-btn")) {
    closeModal();
  }
});

function openModal() {
  const modal = document.getElementById("modal");

  modal.style.display = "block";
}

function closeModal() {
  const modal = document.getElementById("modal");

  modal.style.display = "none";
}
