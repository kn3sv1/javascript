// Small helpers for sending responses. Nothing async here - and that's fine:
// only mark a function `async` when it actually awaits something.

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function menu() {
  return `
    <header class="site-header">
      <span class="brand">async / await</span>
      <nav>
        <a href="/">Home</a>
        <a href="/messages">Messages</a>
        <a href="/api/messages">API</a>
      </nav>
    </header>`;
}

function page(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/public/style.css">
</head>
<body>
  ${menu()}
  <main>
    <h1>${escapeHtml(title)}</h1>
    ${body}
  </main>
</body>
</html>`;
}

function sendHtml(res, status, html) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data, null, 2));
}

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

export {
  escapeHtml,
  page,
  sendHtml,
  sendJson,
  redirect,
};
