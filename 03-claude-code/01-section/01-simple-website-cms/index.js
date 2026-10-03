const http = require("http");
const fs = require("fs");
const path = require("path");

const { getFormData } = require("./lib/formData");
const { saveData, readData } = require("./lib/database");
const { uploadDoctorPhoto, UPLOADS_DIR } = require("./lib/upload");

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME_TYPES = {
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function homePage(res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(`
    <link rel="stylesheet" href="/public/style.css" >
    <img width="200" src="/uploads/doctors/keyboard.png" />
    <script src="/public/hello.js"></script>
    `);
  res.end(`${menu()} Home Page`);
}

function sendHtml(res, status, html) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

function serveStatic(req, res, rootDir, urlPrefix) {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const relPath = decodeURIComponent(pathname.slice(urlPrefix.length));
  const filePath = path.join(rootDir, relPath);

  if (!filePath.startsWith(rootDir)) {
    sendHtml(res, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendHtml(res, 404, "Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
    });
    res.end(data);
  });
}

// console.log(uuid());
// e.g. "f47ac10b-58cc-4372-a567-0e02b2c3d479"

const server = http.createServer(async (req, res) => {
  let parsed;
  try {
    parsed = new URL(req.url, "http://localhost");
  } catch (err) {
    return sendHtml(res, 400, "Bad request");
  }

  // http://localhost:3000/uploads/doctors/keyboard.png
  // http://localhost:3000/public/style.css
  // http://localhost:3000/public/hello.js
  const pathname = parsed.pathname || "/";
  if (pathname.startsWith("/public/")) {
    return serveStatic(req, res, PUBLIC_DIR, "/public/");
  }
  if (pathname.startsWith("/uploads/")) {
    return serveStatic(req, res, UPLOADS_DIR, "/uploads/");
  }

  homePage(res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
