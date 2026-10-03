import http from "http";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { PORT } from "./lib/constants.js";
import { findRoute } from "./lib/router.js";
import { sendHtml } from "./lib/response.js";
import { initDatabase } from "./lib/database.js";
import { errorView } from "./lib/views/calculator.js";

// Side-effect import: we don't take anything from this file,
// importing it just runs its addRoute(...) calls.
import "./lib/routes/calculator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME_TYPES = {
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

// Same idea as before, but with await instead of a callback.
async function serveStatic(req, res, rootDir, urlPrefix) {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const relPath = decodeURIComponent(pathname.slice(urlPrefix.length));
  const filePath = path.join(rootDir, relPath);

  // Do not allow paths like "/public/../index.js" to leave the folder.
  if (!filePath.startsWith(rootDir + path.sep)) {
    sendHtml(res, 403, "Forbidden");
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(data);
  } catch {
    sendHtml(res, 404, "Not found");
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, "http://localhost").pathname;

    if (pathname.startsWith("/public/")) {
      return await serveStatic(req, res, PUBLIC_DIR, "/public/");
    }

    const route = findRoute(req.method, pathname);
    if (route) {
      await route.handler(req, res);
      return;
    }

    sendHtml(res, 404, errorView(404, "Page not found."));
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      sendHtml(res, 500, errorView(500, "Something went wrong. Please try again."));
    }
  }
});

// Top-level await: allowed in ES modules. The server only starts
// after the database folder is ready.
await initDatabase();

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
