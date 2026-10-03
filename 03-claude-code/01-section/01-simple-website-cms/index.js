import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { findRoute } from "./lib/router.js";
import { sendHtml } from "./lib/response.js";
import { UPLOADS_DIR } from "./lib/upload.js";
import { adminNotFoundView } from "./lib/views/admin.js";

// Importing the route files registers their routes (the addRoute calls).
import { sendClientNotFound } from "./lib/routes/client.js";
import "./lib/routes/admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
// CKEditor's ready-to-use browser files, installed with "npm install ckeditor5"
const CKEDITOR_DIR = path.join(__dirname, "node_modules", "ckeditor5", "dist", "browser");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".map": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function serveStatic(req, res, rootDir, urlPrefix) {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const relPath = decodeURIComponent(pathname.slice(urlPrefix.length));
  const filePath = path.join(rootDir, relPath);

  // Do not allow paths like "/public/../index.js" to leave the folder.
  if (!filePath.startsWith(rootDir + path.sep)) {
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
      // Tells the browser to trust our Content-Type and not guess.
      "X-Content-Type-Options": "nosniff",
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, "http://localhost").pathname;

    // Static files
    if (pathname.startsWith("/public/")) {
      return serveStatic(req, res, PUBLIC_DIR, "/public/");
    }
    if (pathname.startsWith("/uploads/")) {
      return serveStatic(req, res, UPLOADS_DIR, "/uploads/");
    }
    if (pathname.startsWith("/vendor/ckeditor5/")) {
      return serveStatic(req, res, CKEDITOR_DIR, "/vendor/ckeditor5/");
    }

    const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

    const route = findRoute(req.method, pathname);
    if (route) {
      await route.handler(req, res, route.params);
      return;
    }

    if (isAdmin) {
      sendHtml(res, 404, adminNotFoundView());
    } else {
      await sendClientNotFound(res);
    }
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      sendHtml(res, 500, "Something went wrong. Please try again.");
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Admin area:       http://localhost:${PORT}/admin`);
});
