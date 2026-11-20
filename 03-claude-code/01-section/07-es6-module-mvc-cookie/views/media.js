import { layout } from "./layout.js";

export function mediaView({ error, user }) {
  let errorMessage = "";
  if (error) {
    errorMessage = `<p class="error">${error}</p>`;
  }

  const content = `
    <style>
      .media-form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 300px;
      }
      .media-form input {
        padding: 8px;
      }
      .error {
        color: red;
      }
    </style>
    <script src="/js/media.js" defer></script>

    <h1>Upload Photo</h1>
    ${errorMessage}

    <form id="media-form" class="media-form" method="POST" action="/api/media" enctype="multipart/form-data">
      <label>
        Name<br />
        <input type="text" name="name" />
      </label>
      <label>
        Upload File<br />
        <input type="file" name="file" required />
      </label>
      <button type="submit">Upload</button>
    </form>
    <div id="media-result"></div>
  `;

  return layout({ title: "Media", content, user });
}
