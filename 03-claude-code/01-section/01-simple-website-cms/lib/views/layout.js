// Shared HTML helpers for all pages.

// Makes text safe to put inside HTML, so "<script>" is shown as text
// instead of being run by the browser. Use it for ALL user-entered text
// (except page content from CKEditor, which is HTML on purpose).
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Messages shown after a redirect, e.g. /admin/pages?msg=page-saved
// We only show messages from this list, never text from the URL itself.
const MESSAGES = {
  "page-created": "Page created.",
  "page-saved": "Page saved.",
  "page-deleted": "Page deleted.",
  "photo-uploaded": "Photo uploaded.",
  "photo-deleted": "Photo deleted.",
};

export function flashMessage(messageKey) {
  const message = MESSAGES[messageKey];
  return message ? `<p class="flash">${message}</p>` : "";
}

// Layout for the public website.
// "menuPages" is the list of pages that should appear in the menu.
export function clientLayout({ title, description = "", menuPages = [], body }) {
  const menuLinks = menuPages
    .map((page) => {
      const href = page.slug === "home" ? "/" : `/pages/${encodeURIComponent(page.slug)}`;
      return `<a href="${href}">${escapeHtml(page.title)}</a>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="stylesheet" href="/vendor/ckeditor5/ckeditor5-content.css">
  <link rel="stylesheet" href="/public/style.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/">My Website</a>
    <nav>
      <a href="/">Home</a>
      ${menuLinks}
    </nav>
  </header>
  <main>
    ${body}
  </main>
</body>
</html>`;
}

// Layout for the admin area.
// "extraHead" lets a page add its own CSS/JS (for example CKEditor).
export function adminLayout({ title, body, extraHead = "" }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} - Admin</title>
  <link rel="stylesheet" href="/public/style.css">
  ${extraHead}
</head>
<body class="admin">
  <header class="site-header admin-header">
    <a class="brand" href="/admin">Admin</a>
    <nav>
      <a href="/admin/pages">Pages</a>
      <a href="/admin/uploads">Photos</a>
      <a href="/" target="_blank">View website</a>
    </nav>
  </header>
  <main>
    ${body}
  </main>
</body>
</html>`;
}
