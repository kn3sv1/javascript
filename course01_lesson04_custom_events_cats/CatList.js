export const CatList = {
  cats: [],

  init() {
    const container = document.getElementById("list-container");

    container.innerHTML = `
      <ul id="cat-list"></ul>
    `;

    document.addEventListener("cat-created", (e) => {
      this.cats.push(e.detail);

      this.render();
    });
  },

  render() {
    const list = document.getElementById("cat-list");

    list.innerHTML = this.cats.map((cat) => `<li>${cat.name}</li>`).join("");
  },
};
