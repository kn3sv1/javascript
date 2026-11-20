// ===== Media page: upload a file with AJAX =====

// Run when the HTML is fully parsed
window.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("media-form");
  form.addEventListener("submit", uploadFile);
});

async function uploadFile(event) {
  // Stop the browser from submitting the form the normal way (page reload)
  event.preventDefault();

  const form = event.target;
  const button = form.querySelector("button");
  const resultBox = document.getElementById("media-result");

  // FormData collects every input in the form: the "name" text and the "file"
  const formData = new FormData(form);

  button.disabled = true;
  resultBox.textContent = "Uploading...";

  try {
    // Don't set Content-Type yourself: the browser adds
    // "multipart/form-data; boundary=..." which the server needs
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
    });

    // 400 / 500 errors: the server sends a plain text message
    if (!response.ok) {
      resultBox.innerHTML = `<p class="error"></p>`;
      resultBox.querySelector("p").textContent = await response.text();
      return;
    }

    const data = await response.json();

    resultBox.innerHTML = `
      <p>✅ ${data.message} <strong>(${data.file_name})</strong></p>
      <img src="${data.url}" alt="Uploaded file" width="250" />
    `;

    // Clear the inputs, ready for the next upload
    form.reset();
  } catch (error) {
    // Network error or server down
    resultBox.innerHTML = `<p class="error">Could not upload file.</p>`;
  } finally {
    // Runs on success and on error
    button.disabled = false;
  }
}
