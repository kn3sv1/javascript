import http from "http";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// PITFALL (ES modules): local imports need the full file name with ".js".
// `import ... from "./lib/formData"` works with require(), but fails here
// with ERR_MODULE_NOT_FOUND.
import { getFormData } from "./lib/formData.js";
import { readData, saveData } from "./lib/database.js";
import { escapeHtml, page, sendHtml, sendJson, redirect } from "./lib/respond.js";
import * as pitfalls from "./lib/pitfalls.js";

// `__dirname` doesn't exist in ES modules - use import.meta.dirname (Node 20.11+).
const ROOT_DIR = import.meta.dirname;
const PORT = 3000;
const PUBLIC_DIR = path.join(ROOT_DIR, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
};

// ---------------------------------------------------------------------------
// Static files: GET /  and  GET /public/*
// ---------------------------------------------------------------------------
async function serveStatic(res, relPath) {
  const filePath = path.join(PUBLIC_DIR, relPath);

  // don't let "/public/../index.js" read files outside the public folder
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    sendHtml(res, 403, "Forbidden");
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(data);
  } catch (err) {
    if (err.code === "ENOENT" || err.code === "EISDIR") {
      sendHtml(res, 404, "Not found");
      return;
    }
    throw err; // unexpected - goes up to the try/catch in createServer
  }
}

// ---------------------------------------------------------------------------
// Messages: read and write data.json
// ---------------------------------------------------------------------------
async function showMessages(res) {
  const messages = await readData();

  const items = messages.length
    ? messages
        .map((m) => `<li><b>${escapeHtml(m.name)}</b>: ${escapeHtml(m.message)}</li>`)
        .join("")
    : "<li>No messages yet.</li>";

  sendHtml(
    res,
    200,
    page(
      "Messages",
      `<ul class="messages">${items}</ul>
       <form method="POST" action="/messages">
         <label>Name <input type="text" name="name" required></label>
         <label>Message <input type="text" name="message" required></label>
         <button type="submit">Save</button>
       </form>`,
    ),
  );
}

async function createMessage(req, res) {
  const form = await getFormData(req);
  const name = (form.name || "").trim();
  const message = (form.message || "").trim();

  if (!name || !message) {
    sendHtml(res, 400, page("Error", `<p>Name and message are required. <a href="/messages">Back</a></p>`));
    return;
  }

  // Without this await we would redirect BEFORE the file is written, and the
  // /messages page could load without the new message (see /pitfalls/fire-and-forget).
  await saveData({ id: crypto.randomUUID(), name, message, createdAt: new Date().toISOString() });
  redirect(res, "/messages");
}

// ---------------------------------------------------------------------------
// Router - plain if / else
// ---------------------------------------------------------------------------
async function router(req, res) {
  const { pathname } = new URL(req.url, "http://localhost");
  const method = req.method;

  if (method === "GET" && pathname === "/") {
    await serveStatic(res, "index.html");
  } else if (method === "GET" && pathname.startsWith("/public/")) {
    await serveStatic(res, decodeURIComponent(pathname.slice("/public/".length)));
  } else if (method === "GET" && pathname === "/messages") {
    await showMessages(res);
  } else if (method === "POST" && pathname === "/messages") {
    await createMessage(req, res);
  } else if (method === "GET" && pathname === "/api/messages") {
    sendJson(res, 200, await readData());
  } else if (method === "GET" && pathname === "/pitfalls/forgot-await") {
    await pitfalls.forgotAwait(req, res);
  } else if (method === "GET" && pathname === "/pitfalls/foreach") {
    await pitfalls.forEachLoop(req, res);
  } else if (method === "GET" && pathname === "/pitfalls/sequential") {
    await pitfalls.sequentialVsParallel(req, res);
  } else if (method === "GET" && pathname === "/pitfalls/try-catch") {
    await pitfalls.tryCatch(req, res);
  } else if (method === "GET" && pathname === "/pitfalls/all-settled") {
    await pitfalls.allVsAllSettled(req, res);
  } else if (method === "GET" && pathname === "/pitfalls/race-condition") {
    await pitfalls.raceCondition(req, res);
  } else if (method === "GET" && pathname === "/pitfalls/fire-and-forget") {
    await pitfalls.fireAndForget(req, res);
  } else if (method === "GET" && pathname === "/pitfalls/blocking") {
    await pitfalls.blocking(req, res);
  } else if (method === "GET" && pathname === "/pitfalls/crash") {
    // Throws on purpose to show that the try/catch below turns it into a 500 page.
    await fs.readFile(path.join(ROOT_DIR, "no-such-file.txt"));
  } else {
    sendHtml(res, 404, page("404", `<p>Nothing at ${escapeHtml(pathname)}</p>`));
  }
}

// ---------------------------------------------------------------------------
// PITFALL: Node's http server does NOT await the request handler.
//
//   http.createServer(async (req, res) => { await router(req, res); });
//
// If router() rejects, nobody is listening for that promise -> "unhandled
// rejection" -> since Node 15 the WHOLE PROCESS CRASHES, and the browser
// that made the request just hangs. So the top level must have its own try/catch.
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  try {
    await router(req, res);
  } catch (err) {
    console.error(`${req.method} ${req.url} failed:`, err);
    if (!res.headersSent) {
      sendHtml(res, 500, page("500", `<p>Something went wrong: ${escapeHtml(err.message)}</p>`));
    } else {
      res.end();
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
