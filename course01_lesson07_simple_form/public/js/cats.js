import { uuidv7 } from "./utils.js";

const CatForm = {
  init() {
    this.cities = ["Limassol", "Paphos", "Larnaka", "Nicosia"];
    this.app = document.getElementById("app");

    return this;
  },

  dropDownToHtml(data) {
    return data
      .map(
        (item) => `
      <option value="${item}">${item}</option>
    `,
      )
      .join("");
  },
  async submitEventListener(e) {
    e.preventDefault();
    const result = document.getElementById("ajax-result");

    // will implement after we see that form works
    const catForm = document.getElementById("catForm");
    const formData = new FormData(catForm);
    // append dynamically
    formData.append("id", uuidv7());

    // just to see in browser what we have in our object
    for (const [key, value] of formData) {
      console.log(key, value);
    }

    // send AJAX fetch request to submit data to server.
    const request = Object.fromEntries(formData);
    try {
      const response = await fetch("/api/cats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      console.log(data);

      result.textContent = `Submitted`;
    } catch (err) {
      console.error(err);
      result.textContent = "Submition failed";
    }
  },
  render() {
    this.app.innerHTML =
      `
      <div class="container">
        <h1>Cat Form</h1>
          <form id="catForm">
            <label>Select folder:</label>
            <select>
              ` +
      this.dropDownToHtml(this.cities) +
      `
            </select>
            <br><br>  
            <label>Name:</label>
            <input type="text" name="name" value="" >
            <label>Age:</label>
            <input type="text" name="age" value="" >
            <label>Photo:</label>
            <input type="text" name="photo" value="" >
            <button type="submit">Upload</button>
          </form>
        <div id="ajax-result"></div>
      </div>
    `;

    // now it (element in DOM) exists after innerHtml
    const form = document.getElementById("catForm");
    form.addEventListener("submit", this.submitEventListener);
  },
};

const catForm = CatForm.init();
catForm.render();
