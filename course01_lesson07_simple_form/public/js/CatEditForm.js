import { uuidv7 } from "./utils.js";

export const CatEditForm = {
  async init(id) {
    this.cat = await this.getCatById(id);
    this.cities = ["Limassol", "Paphos", "Larnaka", "Nicosia"];
    this.app = document.getElementById("app");

    return this;
  },

  dropDownCitiesToHtml(cities) {
    return cities
      .map((city) => {
        const isSelected = city == this.cat.city ? "selected" : "";

        return `<option ${isSelected} value="${city}">${city}</option>`;
      })
      .join("");
  },

    dropDownPhotosToHtml(photos) {
    return photos
      .map((photo) => {
        const isSelected = photo == this.cat.photo ? "selected" : "";

        return `<option ${isSelected} value="${photo}">${photo}</option>`;
      })
      .join("");
  },

  async getPhotos() {
    try {
      const response = await fetch("/files/upload/cats", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      //console.log(data);

      const photos = data.files.map((file) => `/uploads/cats/${file}`);
      //console.log(photos);

      return photos;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  showPhotoPreview(e) {
    const value = e.target.value;
    const result = document.getElementById("photo-preview");
    result.innerHTML = `<img height="100" src="${value}" />`;
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

      result.textContent = `Submitted:` + JSON.stringify(data);
    } catch (err) {
      console.error(err);
      result.textContent = "Submition failed";
    }
  },

  async render() {
    // <div id="ajax-result"></div> - will appear in DOM
    // so we will not use AJAX result at all in this function.
    const photos = await this.getPhotos();

    // <div id="ajax-result"></div> = only here not before.
    this.app.innerHTML =
      `
      <div class="container">
        <h1>Cat Form</h1>
          <form id="catForm">
            <label>Select folder:</label>
            <select name="city">
              ` +
      this.dropDownCitiesToHtml(this.cities) +
      `
            </select>
            <br><br>  
            <label>Name:</label>
            <input type="text" name="name" value="${this.cat.name}" >
            <label>Age:</label>
            <input type="text" name="age" value="${this.cat.age}" >
            <label>Photo:</label>
            <select name="photo" id="cat-form-photo">
              ` +
      this.dropDownPhotosToHtml(photos) +
      `
            </select>
            <div id="photo-preview"></div>
            <button type="submit">Create</button>
          </form>
        <div id="ajax-result"></div>
      </div>
    `;

    // now it (element in DOM) exists after innerHtml
    const form = document.getElementById("catForm");
    form.addEventListener("submit", this.submitEventListener);

    const catFormPhoto = document.getElementById("cat-form-photo");
    catFormPhoto.addEventListener("change", this.showPhotoPreview);
    // as soon as we open form we should see the preview who is selected
    // that is why add this code bellow that triggers the change event.
    // so our listener call back function will be called without users help to change drop down.
    catFormPhoto.dispatchEvent(new Event("change"));
  },

  getCities() {
    const cities = this.cities;
    return cities;
  },
  async getCatById(id) {
    const response = await fetch("/api/cats?id=" + id);
    const data = await response.json();
    return data[0];
  },
};
