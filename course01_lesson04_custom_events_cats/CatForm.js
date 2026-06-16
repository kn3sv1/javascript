export const CatForm = {
  init() {
    const container = document.getElementById("form-container");

    container.innerHTML = `
      <form id="cat-form">
        <input
          id="cat-name"
          placeholder="Cat name"
        >
        <button type="submit">
          Save Cat
        </button>
      </form>
    `;

    const form = document.getElementById("cat-form");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      console.log("submitted");

      const name = document.getElementById("cat-name").value;

      const newCat = {
        id: Date.now(),
        name,
      };

      document.dispatchEvent(
        new CustomEvent("cat-created", {
          detail: newCat,
        }),
      );
    });
  },
};
