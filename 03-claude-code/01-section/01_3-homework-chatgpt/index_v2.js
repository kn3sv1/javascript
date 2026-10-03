import http from "node:http";
import fs from "node:fs";
import path from "node:path";

import { getFormData } from "./lib/formData.js";
import { saveData, readData } from "./lib/database.js";
import { uploadDoctorPhoto, UPLOADS_DIR } from "./lib/upload.js";

const PORT = 3000;
const PUBLIC_DIR = path.join(import.meta.dirname, "public");

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

function menu() {
  return `
  <a href="/">Home page</a></br>
  <a href="/comments">Comments</a></br>
  <a href="/angie">Angie's page</a></br>
  <a href="/form">Form page</a></br>
  <a href="/show-upload">upload file</a></br></br>
  `;
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
