const FileUploader = {
  init() {
    this.folders = ["dogs", "cats", "cars", "doctors", "flowers"];
    this.app = document.getElementById("app");

    return this;
  },

  foldersHtml(folders) {
    // refactor to for loop
    console.log(folders);

    return folders
      .map(
        (folder) => `
      <option value="${folder}">${folder}</option>
    `,
      )
      .join("");

    // hard coded. Refactored above.
    // return `
    // <option value="dogs">dogs</option>
    // <option value="cats">cats</option>
    // <option value="cars">cars</option>
    // <option value="doctors">doctors</option>
    // `;
  },
  async submitEventListener(e) {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput");
    const folderSelect = document.getElementById("folderSelect");
    const result = document.getElementById("upload-result");

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
      <div class="container">
        <h1>File Uploader</h1>
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
        <div id="upload-result"></div>
      </div>
    `;

    // now it (element in DOM) exists after innerHtml
    const form = document.getElementById("uploadForm");
    form.addEventListener("submit", this.submitEventListener);
  },
};

const uploader = FileUploader.init();
uploader.render();
