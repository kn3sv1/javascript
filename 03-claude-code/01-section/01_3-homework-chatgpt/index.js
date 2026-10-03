import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { serveStatic } from "./lib/staticFile.js";

const PORT = 3000;
const PUBLIC_DIR = path.join(import.meta.dirname, "public");
const UPLOADS_DIR = path.join(import.meta.dirname, "uploads");
console.log("UPLOADS_DIR: " + UPLOADS_DIR);

function sendHtml(res, status, html) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function homePage(res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(`
    <link rel="stylesheet" href="/public/style.css" >
    <img width="200" src="/uploads/doctors/keyboard.png" />
    <script src="/public/hello.js"></script>
    `);
  res.end(`Home Page`);
}

function router(req, res) {
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
  console.log("pathname: " + pathname);

  // http://localhost:3000/angie
  if (pathname.startsWith("/angie")) {
    sendHtml(res, 200, '<span style="color:blue">Hello from Angie</span>');
    return;
  }
  // http://localhost:3000/roma
  if (pathname.startsWith("/roma")) {
    sendHtml(res, 200, '<span style="color:red">Hello from Roma</span>');
    return;
  }

  // for rest pages better to show 404 page but it is ok for now
  homePage(res);
}

const server = http.createServer((req, res) => {
  router(req, res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
