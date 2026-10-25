export function sendHtml(res, status, html) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

export function menu() {
  return `
    <nav class="menu">
      <a href="/">Home</a>
    </nav>
  `;
}

export function layout(title, content) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <link rel="stylesheet" href="/public/style.css">
      </head>
      <body>
        ${menu()}
        <main>
          ${content}
        </main>
      </body>
    </html>
  `;
}

export function homePage(res) {
  sendHtml(
    res,
    200,
    layout(
      "Home",
      `
    <footer class="footer">
      © ${new Date().getFullYear()} · Made while learning JavaScript
    </footer>

    <script src="/public/homepage.js"></script>
  `,
    ),
  );
}

export function notFoundPage(res) {
  sendHtml(
    res,
    404,
    layout(
      "Error",
      `
    <h1 style="color: red">Page not found</h1>`,
    ),
  );
}

export function showErrorPage(res, err) {
  res.writeHead(400, { "Content-Type": "text/html" });
  res.end(`ErrorPage ${err}`);
}


