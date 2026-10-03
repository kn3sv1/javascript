// Small helpers for sending responses + the two "escape" helpers.
//
// REMEMBER: a URL inside HTML is TWO languages at once, so it needs TWO escapes:
//   1. encodeURIComponent(value) - so the value can't break the URL   (& ? # / %)
//   2. escapeHtml(url)           - so the URL can't break the HTML    (" ' < >)
// One does not replace the other.

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// decodeURIComponent THROWS (URIError) on a broken sequence like "100%".
// Anyone can type such a URL, so never call it on user input without a guard.
function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

// Header values must be ASCII/latin1. "звіт.pdf" in a header -> Node throws
// ERR_INVALID_CHAR. RFC 6266 says: put a plain ASCII fallback in filename=""
// and the real name, percent-encoded as UTF-8, in filename*=.
function contentDisposition(fileName) {
  const asciiFallback = fileName.replace(/[^\x20-\x7e]|["\\]/g, "_");
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

function menu() {
  return `
    <header class="site-header">
      <span class="brand">encodeURIComponent()</span>
      <nav>
        <a href="/">Home</a>
        <a href="/people">People</a>
        <a href="/files">Files</a>
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
  safeDecode,
  contentDisposition,
  page,
  sendHtml,
  sendJson,
  redirect,
};
