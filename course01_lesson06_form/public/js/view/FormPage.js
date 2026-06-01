export const FormPage = {
  init(selector) {
    this.selector = selector;
    return this;
  },

  showMenu() {
    const folders = ["dogs", "cats", "cars", "doctors"];

    const foldersHtml = (folders) => {
      // refactor to for loop
      return `
    <option vaue="dogs">dogs</option>
    <option vaue="cats">cats</option>
    <option vaue="cars">cars</option>
    <option vaue="doctors">doctors</option>
    `;
    };

    const app = document.getElementById("app");

    app.innerHTML =
      `
    <form id="uploadForm">
    <label>Select folder:</label>
    <select id="folderSelect">
        ` +
      foldersHtml(folders) +
      `
    </select>
    <br><br>  
    <input type="file" id="fileInput" />
    <button type="submit">Upload</button>
    </form>
    <div id="result"></div>
    `;
  },
};
