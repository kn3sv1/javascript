export const CatList = {
  init() {
    this.app = document.getElementById("app");

    return this;
  },

  async getCats() {
    try {
      const response = await fetch("/api/cats");
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
    }
  },

  async render() {
    const cats = await this.getCats();
    console.log(cats);

    const rows = cats
      .map((cat) => {
        return `<tr>
            <td>${cat.city}</td>
            <td>${cat.name}</td>
            <td>${cat.age}</td>

            <td>
            <img
                src="${cat.photo}"
                alt="${cat.name}"
            >
            </td>
        </tr>`;
      })
      .join("");

    this.app.innerHTML = `

<div class="table">

    <h1>Cats List</h1>

    <table>

        <thead>
            <tr>
                <th>City</th>
                <th>Name</th>
                <th>Age</th>
                <th>Photo</th>
            </tr>
        </thead>

        <tbody>
            ${rows}
        </tbody>

    </table>

</div>

    `;
  },
};
