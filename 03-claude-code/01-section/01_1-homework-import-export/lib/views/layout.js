// Shared HTML helpers for all pages.
import { APP_NAME } from "../constants.js";

// Makes text safe to put inside HTML, so "<script>" is shown as text
// instead of being run by the browser. Use it for ALL user-entered text.
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function layout({ title, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} - ${APP_NAME}</title>
  <link rel="stylesheet" href="/public/style.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/">${APP_NAME}</a>
    <nav>
      <a href="/">Calculator</a>
      <a href="/history">History</a>
    </nav>
  </header>
  <main>
    ${body}
  </main>
</body>
</html>`;
}
