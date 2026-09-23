function menu() {
  return `
  <a href="/">Home page</a></br>
  <a href="/cats">Cats page</a></br>
  <a href="/angie">Angie's page</a></br>
  <a href="/form">Form page</a></br>
  <a href="/show-upload">upload file</a></br></br>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function homePage(res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(`
    <link rel="stylesheet" href="/public/style.css" >
    <img width="200" src="/uploads/doctors/keyboard.png" />
    <script src="/public/hello.js"></script>
    `);
  res.end(`${menu()} Home Page`);
}

function angiePage(res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`${menu()} Angie's Page`);
}

function showFormPage(res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
    <link rel="stylesheet" href="/public/style.css" />
    ${menu()}
    <main>
      <h1>Add a Cat</h1>
      <form method="POST" action="/cats">
        <label>Name
          <input type="text" name="name" required />
        </label>
        <label>Age
          <input type="number" name="age" min="0" required />
        </label>
        <label>Color
          <input type="text" name="color" required />
        </label>
        <div class="form-actions">
          <button type="submit">Add Cat</button>
          <a class="button secondary" href="/cats">Cancel</a>
        </div>
      </form>
    </main>
    `);
}

function showUploadFilePage(res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
      ${menu()}
      <form action="/upload" method="POST" enctype="multipart/form-data">
        <label for="file">Choose a file:</label><br><br>
        <input type="file" id="file" name="file"><br><br>
        <button type="submit">Upload</button>
      </form>
      `);
}

function commentsPage(res, comments) {
  res.writeHead(200, { "Content-Type": "text/html" });

  let html = "";
  for (const item of comments) {
    html = html + `<p> Name: ${item.name}, Messege: ${item.message}</p>`;
  }

  res.end(`${menu()} ${html}`);
}

function showErrorPage(res, err) {
  res.writeHead(400, { "Content-Type": "text/html" });
  res.end(`ErrorPage ${err}`);
}

function catsPage(res, cats) {
  const rows = cats
    .map(
      (cat) => `
        <tr>
          <td>${cat.id}</td>
          <td>${escapeHtml(cat.name)}</td>
          <td>${cat.age}</td>
          <td>${escapeHtml(cat.color)}</td>
          <td class="actions">
            <a class="button" href="/cats/${cat.id}/edit">Edit</a>
            <button class="danger" data-delete-id="${cat.id}">Delete</button>
          </td>
        </tr>`,
    )
    .join("");

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
    <link rel="stylesheet" href="/public/style.css" />
    ${menu()}
    <main>
      <h1>Cats</h1>
      <p><a class="button" href="/form">Add a new cat</a></p>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Color</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="5">No cats yet.</td></tr>`}
        </tbody>
      </table>
    </main>
    <script>
      document.querySelectorAll("[data-delete-id]").forEach((button) => {
        button.addEventListener("click", async () => {
          if (!confirm("Delete this cat?")) return;

          const id = button.getAttribute("data-delete-id");
          const response = await fetch("/cats/" + id, { method: "DELETE" });

          if (response.ok) {
            button.closest("tr").remove();
          } else {
            alert("Could not delete cat");
          }
        });
      });
    </script>
    `);
}

function editCatPage(res, cat) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
    <link rel="stylesheet" href="/public/style.css" />
    ${menu()}
    <main>
      <h1>Edit ${escapeHtml(cat.name)}</h1>
      <form id="edit-cat-form">
        <label>Name
          <input type="text" name="name" value="${escapeHtml(cat.name)}" required />
        </label>
        <label>Age
          <input type="number" name="age" value="${cat.age}" min="0" required />
        </label>
        <label>Color
          <input type="text" name="color" value="${escapeHtml(cat.color)}" required />
        </label>
        <div class="form-actions">
          <button type="submit">Save</button>
          <a class="button secondary" href="/cats">Cancel</a>
        </div>
      </form>
    </main>
    <script>
      document.getElementById("edit-cat-form").addEventListener("submit", async (event) => {
        event.preventDefault();

        const params = new URLSearchParams(new FormData(event.target));

        const response = await fetch("/cats/${cat.id}", {
          method: "PUT",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        });

        if (response.ok) {
          window.location.href = "/cats";
          return;
        }

        const data = await response.json();
        alert((data.errors || [data.error]).join("\\n"));
      });
    </script>
    `);
}

function catCreatedPage(res, cat) {
  res.writeHead(201, { "Content-Type": "text/html" });
  res.end(`
    <link rel="stylesheet" href="/public/style.css" />
    ${menu()}
    <main>
      <h1>Cat Added</h1>
      <div class="flash">${escapeHtml(cat.name)} was added successfully.</div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Color</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${cat.id}</td>
            <td>${escapeHtml(cat.name)}</td>
            <td>${cat.age}</td>
            <td>${escapeHtml(cat.color)}</td>
          </tr>
        </tbody>
      </table>
      <div class="form-actions">
        <a class="button" href="/form">Add another cat</a>
        <a class="button secondary" href="/cats">View all cats</a>
      </div>
    </main>
    `);
}

function catFormErrorPage(res, errors) {
  res.writeHead(400, { "Content-Type": "text/html" });
  res.end(`
    <link rel="stylesheet" href="/public/style.css" />
    ${menu()}
    <main>
      <h1>Could not add cat</h1>
      <div class="flash error">
        <ul>
          ${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join("")}
        </ul>
      </div>
      <p><a class="button" href="/form">Back to form</a></p>
    </main>
    `);
}

module.exports = {
  homePage,
  angiePage,
  showFormPage,
  commentsPage,
  showUploadFilePage,
  showErrorPage,
  catsPage,
  editCatPage,
  catCreatedPage,
  catFormErrorPage,
};
