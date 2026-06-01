import { FormPage } from "./view/FormPage";

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
        body: formData
      }
    );

    const data = await response.json();

    result.textContent =
      `Uploaded: ${data.file}`;
  } catch (err) {
    console.error(err);
    result.textContent =
      "Upload failed";
  }
});