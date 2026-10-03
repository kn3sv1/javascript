import { escapeHtml, adminLayout, flashMessage } from "./layout.js";

// Formats "2026-10-03T10:00:00.000Z" as "2026-10-03 10:00"
function formatDate(isoDate) {
  return isoDate ? isoDate.slice(0, 16).replace("T", " ") : "";
}

export function dashboardView({ pageCount, photoCount }) {
  const body = `
    <h1>Admin</h1>
    <div class="card-links">
      <a class="card" href="/admin/pages">Pages <span class="card-description">${pageCount} page(s)</span></a>
      <a class="card" href="/admin/pages/create">Create page <span class="card-description">Add a new page</span></a>
      <a class="card" href="/admin/uploads">Photos <span class="card-description">${photoCount} photo(s)</span></a>
    </div>`;

  return adminLayout({ title: "Dashboard", body });
}

// ---------- Pages ----------

export function pagesListView(pages, messageKey) {
  const rows = pages
    .map((page) => {
      const thumb = page.mainImage
        ? `<img class="thumb" src="/uploads/${escapeHtml(page.mainImage)}" alt="">`
        : `<span class="no-photo">No image</span>`;
      const url = page.slug === "home" ? "/" : `/pages/${encodeURIComponent(page.slug)}`;

      return `
        <tr>
          <td>${thumb}</td>
          <td><strong>${escapeHtml(page.title)}</strong><br><a href="${url}" target="_blank">${escapeHtml(url)}</a></td>
          <td>${page.published ? "Published" : "Draft"}${page.showInMenu ? ", in menu" : ""}</td>
          <td>${formatDate(page.updatedAt)}</td>
          <td class="actions">
            <a href="/admin/pages/edit/${encodeURIComponent(page.id)}">Edit</a>
            <form class="inline-form" method="POST" action="/admin/pages/delete/${encodeURIComponent(page.id)}"
                  onsubmit="return confirm('Delete this page?');">
              <button type="submit" class="danger">Delete</button>
            </form>
          </td>
        </tr>`;
    })
    .join("");

  const table = pages.length
    ? `<table>
        <thead><tr><th>Image</th><th>Title</th><th>Status</th><th>Updated</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`
    : `<p>No pages yet.</p>`;

  const body = `
    <div class="page-heading">
      <h1>Pages</h1>
      <a class="button" href="/admin/pages/create">+ Create page</a>
    </div>
    ${flashMessage(messageKey)}
    ${table}
    <p class="hint">Tip: a page with the slug <code>home</code> is shown on the home page (<code>/</code>).</p>`;

  return adminLayout({ title: "Pages", body });
}

// <select> with all uploaded photos, grouped by folder.
function mainImageSelect(photoFolders, selectedImage) {
  const groups = photoFolders
    .map(({ folder, photos }) => {
      const options = photos
        .map((photo) => {
          const selected = photo === selectedImage ? " selected" : "";
          return `<option value="${escapeHtml(photo)}"${selected}>${escapeHtml(photo)}</option>`;
        })
        .join("");
      return options ? `<optgroup label="${escapeHtml(folder)}">${options}</optgroup>` : "";
    })
    .join("");

  return `
    <select name="mainImage" id="mainImage">
      <option value="">- No image -</option>
      ${groups}
    </select>`;
}

// Form for both "create" and "edit".
// "page" holds the current values (from the database or from the submitted form).
export function pageFormView({ heading, action, page, errors = [], photoFolders }) {
  const errorList = errors.length
    ? `<ul class="errors">${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join("")}</ul>`
    : "";

  const preview = page.mainImage ? `/uploads/${escapeHtml(page.mainImage)}` : "";

  const body = `
    <h1>${escapeHtml(heading)}</h1>
    ${errorList}
    <form class="wide-form" method="POST" action="${action}">
      <label>
        Title
        <input type="text" name="title" value="${escapeHtml(page.title)}" required maxlength="200">
      </label>

      <label>
        Slug (address of the page: /pages/<em>slug</em>)
        <input type="text" name="slug" value="${escapeHtml(page.slug)}" maxlength="100"
               pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="Leave empty to create it from the title">
      </label>

      <label>
        Description
        <textarea name="description" rows="2" maxlength="500">${escapeHtml(page.description)}</textarea>
      </label>

      <label>
        Main image
        ${mainImageSelect(photoFolders, page.mainImage)}
      </label>
      <img id="mainImagePreview" class="image-preview" src="${preview}" alt="" ${preview ? "" : "hidden"}>
      <p class="hint">Upload new photos on the <a href="/admin/uploads" target="_blank">Photos</a> page, then reload this page.</p>

      <label>
        Content
        <textarea name="content" id="content" rows="12">${escapeHtml(page.content)}</textarea>
      </label>

      <div class="checkbox-row">
        <label class="checkbox"><input type="checkbox" name="published" value="1"${page.published ? " checked" : ""}> Published</label>
        <label class="checkbox"><input type="checkbox" name="showInMenu" value="1"${page.showInMenu ? " checked" : ""}> Show in menu</label>
        <label class="inline-label">
          Menu order
          <input type="number" name="menuOrder" value="${escapeHtml(page.menuOrder)}" min="0" max="999">
        </label>
      </div>

      <div class="form-actions">
        <button type="submit">Save page</button>
        <a class="button secondary" href="/admin/pages">Cancel</a>
      </div>
    </form>`;

  // CKEditor is loaded only on this page. "defer" keeps the script order.
  const extraHead = `
    <link rel="stylesheet" href="/vendor/ckeditor5/ckeditor5.css">
    <script src="/vendor/ckeditor5/ckeditor5.umd.js" defer></script>
    <script src="/public/admin.js" defer></script>`;

  return adminLayout({ title: heading, body, extraHead });
}

export function adminNotFoundView() {
  const body = `<h1>Not found</h1><p><a href="/admin">Back to the dashboard</a></p>`;
  return adminLayout({ title: "Not found", body });
}

// ---------- Photos ----------

export function uploadsView({ photoFolders, folderNames, messageKey, error = "" }) {
  const folderOptions = folderNames
    .map((folder) => `<option value="${escapeHtml(folder)}">${escapeHtml(folder)}</option>`)
    .join("");

  const sections = photoFolders
    .map(({ folder, photos }) => {
      const items = photos
        .map((photo) => `
          <figure class="photo">
            <a href="/uploads/${escapeHtml(photo)}" target="_blank">
              <img src="/uploads/${escapeHtml(photo)}" alt="" loading="lazy">
            </a>
            <figcaption>
              <input type="text" readonly value="/uploads/${escapeHtml(photo)}" onclick="this.select()">
              <form method="POST" action="/admin/uploads/delete" onsubmit="return confirm('Delete this photo?');">
                <input type="hidden" name="photo" value="${escapeHtml(photo)}">
                <button type="submit" class="danger small">Delete</button>
              </form>
            </figcaption>
          </figure>`)
        .join("");

      return `
        <section>
          <h2>${escapeHtml(folder)} <span class="count">(${photos.length})</span></h2>
          ${items ? `<div class="photo-grid">${items}</div>` : `<p class="no-photo">No photos in this folder.</p>`}
        </section>`;
    })
    .join("");

  const body = `
    <h1>Photos</h1>
    ${flashMessage(messageKey)}
    ${error ? `<ul class="errors"><li>${escapeHtml(error)}</li></ul>` : ""}

    <!-- The folder <select> must be BEFORE the file input (see lib/upload.js) -->
    <form method="POST" action="/admin/uploads" enctype="multipart/form-data">
      <label>
        Folder
        <select name="folder" required>${folderOptions}</select>
      </label>
      <label>
        Photo (JPG, PNG, GIF or WEBP, max 5 MB)
        <input type="file" name="file" accept="image/jpeg,image/png,image/gif,image/webp" required>
      </label>
      <div class="form-actions">
        <button type="submit">Upload</button>
      </div>
    </form>

    ${sections}`;

  return adminLayout({ title: "Photos", body });
}
