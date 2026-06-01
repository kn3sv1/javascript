const FileUploader = {
  init() {
    this.folders = ["dogs", "cats", "cars", "doctors"];
    this.app = document.getElementById("app");

    return this;
  },

  foldersHtml(folders) {
    // refactor to for loop
    return `
    <option vaue="dogs">dogs</option>
    <option vaue="cats">cats</option>
    <option vaue="cars">cars</option>
    <option vaue="doctors">doctors</option>
    `;
  },
  async submitEventListener(e) {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput");
    const folderSelect = document.getElementById("folderSelect");
    const result = document.getElementById("result");

    const file = fileInput.files[0];
    const folder = folderSelect.value;
    //console.log("selected folder: " + folder);

    if (!file) {
      result.textContent = "Select a file";
      return;
    }

    const formData = new FormData();

    // "file" must match upload.single("file")
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://localhost:3000/files/upload/" + folder,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      result.textContent = `Uploaded: ${data.file}`;
    } catch (err) {
      console.error(err);
      result.textContent = "Upload failed";
    }
  },
  render() {
    this.app.innerHTML =
      `
    <form id="uploadForm">
      <label>Select folder:</label>
      <select id="folderSelect">
        ` +
      this.foldersHtml(this.folders) +
      `
      </select>
      <br><br>  
      <input type="file" id="fileInput" />
      <button type="submit">Upload</button>
    </form>
    <div id="result"></div>
    `;

    // now it (element in DOM) exists after innerHtml
    const form = document.getElementById("uploadForm");
    form.addEventListener("submit", this.submitEventListener);
  },
};

const uploader = FileUploader.init();
uploader.render();
