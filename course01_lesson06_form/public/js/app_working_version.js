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

const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const folderSelect = document.getElementById("folderSelect");
const result = document.getElementById("result");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  const folder = folderSelect.value;
  console.log("selected folder: " + folder);

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
});
