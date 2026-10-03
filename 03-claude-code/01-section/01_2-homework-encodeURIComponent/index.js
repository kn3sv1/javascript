import http from "http";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// ES modules need the full file name - "./lib/formData" without ".js" fails.
import { getFormData } from "./lib/formData.js";
import { readData, saveData, findByName } from "./lib/database.js";
import { uploadFile, UPLOADS_DIR, FILES_DIR } from "./lib/upload.js";
import {
  escapeHtml,
  safeDecode,
  contentDisposition,
  page,
  sendHtml,
  sendJson,
  redirect,
} from "./lib/respond.js";
import * as pitfalls from "./lib/pitfalls.js";

const PORT = 3000;
// __dirname doesn't exist in ES modules - import.meta.dirname replaces it (Node 20.11+).
const PUBLIC_DIR = path.join(import.meta.dirname, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];

// ---------------------------------------------------------------------------
// Static files: /public/*  and  /uploads/*
// ---------------------------------------------------------------------------
async function serveStatic(res, rootDir, encodedRelPath) {
  // The browser sends "/uploads/files/my%20cat.png". The file on disk is
  // "my cat.png", so we must DECODE - and decoding can fail ("100%").
  const relPath = safeDecode(encodedRelPath);
  if (relPath === null) {
    sendHtml(res, 400, page("400", `<p>Malformed URL: <code>${escapeHtml(encodedRelPath)}</code>
      &ndash; <code>decodeURIComponent</code> would have thrown here.</p>`));
    return;
  }

  // Decoding turns "%2E%2E%2F" into "../" - so check the path AFTER decoding.
  const filePath = path.join(rootDir, relPath);
  if (!filePath.startsWith(rootDir + path.sep)) {
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
      sendHtml(res, 404, page("404", `<p>No file <code>${escapeHtml(relPath)}</code></p>`));
      return;
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// People: a name goes into a PATH segment (/people/<name>) and a QUERY (?q=)
// ---------------------------------------------------------------------------
async function showPeople(res, q) {
  const people = await readData();
  const found = q ? people.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())) : people;

  const rows = found
    .map((p) => {
      // ❌ value glued into the URL as is - only HTML-escaped
      const rawHref = `/people/${p.name}`;
      const rawSearch = `/people?q=${p.name}`;
      // ✅ value encoded first, then the whole URL HTML-escaped
      const goodHref = `/people/${encodeURIComponent(p.name)}`;
      const goodSearch = `/people?q=${encodeURIComponent(p.name)}`;

      return `<tr>
        <td><b>${escapeHtml(p.name)}</b><br><small>${escapeHtml(p.note || "")}</small></td>
        <td class="bad"><a href="${escapeHtml(rawHref)}">${escapeHtml(rawHref)}</a><br>
                        <a href="${escapeHtml(rawSearch)}">${escapeHtml(rawSearch)}</a></td>
        <td class="good"><a href="${escapeHtml(goodHref)}">${escapeHtml(goodHref)}</a><br>
                         <a href="${escapeHtml(goodSearch)}">${escapeHtml(goodSearch)}</a></td>
      </tr>`;
    })
    .join("");

  sendHtml(
    res,
    200,
    page(
      "People",
      `<p>Click the same person in both columns. The left links are built with
       <code>"/people/" + name</code>, the right ones with
       <code>"/people/" + encodeURIComponent(name)</code>.</p>

       <form method="GET" action="/people" class="inline">
         <label>Search <input type="text" name="q" value="${escapeHtml(q || "")}"></label>
         <button type="submit">Search</button>
       </form>
       <p><small>A &lt;form&gt; encodes its fields for you. Links you build
       by hand (in templates or JS) are YOUR job.</small></p>
       ${q !== null ? `<p class="flash">Server received <code>q = ${escapeHtml(JSON.stringify(q))}</code>
         &ndash; ${found.length} match(es). <a href="/people">clear</a></p>` : ""}

       <table>
         <tr><th>Name</th><th>❌ not encoded</th><th>✅ encodeURIComponent</th></tr>
         ${rows || `<tr><td colspan="3">Nobody found.</td></tr>`}
       </table>

       <h2>Add a person</h2>
       <form method="POST" action="/people">
         <label>Name <input type="text" name="name" required placeholder="Rock 'n' Roll / 50% off #1"></label>
         <label>Note <input type="text" name="note"></label>
         <button type="submit">Save</button>
       </form>`,
    ),
  );
}

async function showPerson(req, res, segment) {
  // Like a real router's "/people/:name" - one segment, no "/" allowed.
  // "AC/DC" sent without encoding arrives as TWO segments and matches nothing.
  if (segment === "" || segment.includes("/")) {
    return personNotFound(req, res, segment, null, segment === ""
      ? "The name is empty. Everything after <code>#</code> stays in the browser - the server never sees it."
      : "The name contains a raw <code>/</code>, so it became an extra path segment.");
  }

  const name = safeDecode(segment);
  if (name === null) {
    return personNotFound(req, res, segment, null,
      "<code>decodeURIComponent</code> threw <b>URIError: URI malformed</b> - a raw <code>%</code> is not followed by two hex digits.",
      400);
  }

  const person = await findByName(name);
  if (!person) {
    return personNotFound(req, res, segment, name, "No person with exactly this name.");
  }

  sendHtml(
    res,
    200,
    page(
      person.name,
      `<p class="flash">Found! <code>${escapeHtml(segment)}</code> decoded back to
       <code>${escapeHtml(JSON.stringify(name))}</code>.</p>
       <p>${escapeHtml(person.note || "")}</p>
       <p><a href="/people">&larr; all people</a></p>`,
    ),
  );
}

function personNotFound(req, res, segment, decoded, reason, status = 404) {
  const url = new URL(req.url, "http://localhost");
  sendHtml(
    res,
    status,
    page(
      "Person not found",
      `<div class="explanation"><p>${reason}</p></div>
       <pre>${escapeHtml(
         [
           `req.url          -> ${req.url}`,
           `name segment     -> ${JSON.stringify(segment)}`,
           `decoded          -> ${decoded === null ? "(not decoded)" : JSON.stringify(decoded)}`,
           `query string     -> ${JSON.stringify(url.search)}`,
         ].join("\n"),
       )}</pre>
       <p><a href="/people">&larr; all people</a></p>`,
    ),
  );
}

async function createPerson(req, res) {
  const form = await getFormData(req);
  const name = (form.name || "").trim();
  if (!name) {
    sendHtml(res, 400, page("Error", `<p>Name is required. <a href="/people">Back</a></p>`));
    return;
  }

  await saveData({ id: crypto.randomUUID(), name, note: (form.note || "").trim() });

  // ❌ redirect(res, `/people/${name}`);
  //    "AC/DC" -> wrong page; "Київ" -> Node throws ERR_INVALID_CHAR
  //    (header values can't hold non-latin1 characters) -> 500.
  // ✅
  redirect(res, `/people/${encodeURIComponent(name)}`);
}

// ---------------------------------------------------------------------------
// Files: user-chosen file names inside <img src>, links and headers
// ---------------------------------------------------------------------------
async function showFiles(res) {
  const names = (await fs.readdir(FILES_DIR)).filter((n) => n !== ".gitkeep");

  const rows = names
    .map((name) => {
      const rawUrl = `/uploads/files/${name}`;
      const goodUrl = `/uploads/files/${encodeURIComponent(name)}`;
      const downloadUrl = `/download?file=${encodeURIComponent(name)}`;
      const isImage = IMAGE_EXT.includes(path.extname(name).toLowerCase());
      const preview = (url) =>
        isImage ? `<img class="thumb" src="${escapeHtml(url)}" alt="">` : "";

      return `<tr>
        <td><b>${escapeHtml(name)}</b></td>
        <td class="bad">${preview(rawUrl)}<br><a href="${escapeHtml(rawUrl)}">${escapeHtml(rawUrl)}</a></td>
        <td class="good">${preview(goodUrl)}<br><a href="${escapeHtml(goodUrl)}">${escapeHtml(goodUrl)}</a></td>
        <td><a href="${escapeHtml(downloadUrl)}">download</a></td>
      </tr>`;
    })
    .join("");

  sendHtml(
    res,
    200,
    page(
      "Files",
      `<p>Upload files with "bad" names, e.g. <code>my cat #1.png</code>,
       <code>100% done.txt</code>, <code>Tom &amp; Jerry.png</code>, <code>звіт.txt</code>.
       Then compare the two columns.</p>
       <form method="POST" action="/files" enctype="multipart/form-data">
         <label>File <input type="file" name="file" required></label>
         <button type="submit">Upload</button>
       </form>
       <table>
         <tr><th>Name on disk</th><th>❌ not encoded</th><th>✅ encodeURIComponent</th><th>Header</th></tr>
         ${rows || `<tr><td colspan="4">No files yet.</td></tr>`}
       </table>
       <p><small>"download" sends <code>Content-Disposition</code> with
       <code>filename*=UTF-8''&lt;encodeURIComponent(name)&gt;</code> &ndash;
       see <a href="/pitfalls/headers">/pitfalls/headers</a>.</small></p>`,
    ),
  );
}

async function createFile(req, res) {
  const file = await uploadFile(req, res);
  if (!file) {
    sendHtml(res, 400, page("Error", `<p>No file. <a href="/files">Back</a></p>`));
    return;
  }
  redirect(res, "/files");
}

async function downloadFile(res, name) {
  // searchParams.get() already decoded it - do NOT call decodeURIComponent again
  // (a file called "50%25.txt" would turn into "50%.txt" - double decoding).
  if (!name || name !== path.basename(name)) {
    sendHtml(res, 400, page("400", "<p>Bad file name</p>"));
    return;
  }

  let data;
  try {
    data = await fs.readFile(path.join(FILES_DIR, name));
  } catch (err) {
    if (err.code === "ENOENT") {
      sendHtml(res, 404, page("404", `<p>No file <code>${escapeHtml(name)}</code></p>`));
      return;
    }
    throw err;
  }

  res.writeHead(200, {
    "Content-Type": "application/octet-stream",
    // ❌ `attachment; filename="${name}"` -> ERR_INVALID_CHAR for "звіт.txt"
    "Content-Disposition": contentDisposition(name),
  });
  res.end(data);
}

// ---------------------------------------------------------------------------
// Router - plain if / else
// ---------------------------------------------------------------------------
async function router(req, res) {
  // new URL() does NOT decode the pathname: "/people/AC%2FDC" stays as is.
  // searchParams.get() DOES decode the values (and turns + into a space).
  const url = new URL(req.url, "http://localhost");
  const { pathname } = url;
  const method = req.method;

  if (method === "GET" && pathname === "/") {
    await serveStatic(res, PUBLIC_DIR, "index.html");
  } else if (method === "GET" && pathname.startsWith("/public/")) {
    await serveStatic(res, PUBLIC_DIR, pathname.slice("/public/".length));
  } else if (method === "GET" && pathname.startsWith("/uploads/")) {
    await serveStatic(res, UPLOADS_DIR, pathname.slice("/uploads/".length));
  } else if (method === "GET" && pathname === "/people") {
    await showPeople(res, url.searchParams.get("q"));
  } else if (method === "POST" && pathname === "/people") {
    await createPerson(req, res);
  } else if (method === "GET" && pathname.startsWith("/people/")) {
    await showPerson(req, res, pathname.slice("/people/".length));
  } else if (method === "GET" && pathname === "/files") {
    await showFiles(res);
  } else if (method === "POST" && pathname === "/files") {
    await createFile(req, res);
  } else if (method === "GET" && pathname === "/download") {
    await downloadFile(res, url.searchParams.get("file"));
  } else if (method === "GET" && pathname === "/api/echo") {
    // Used by public/app.js: shows exactly what the server received.
    sendJson(res, 200, {
      rawUrl: req.url,
      pathname,
      params: [...url.searchParams],
      q: url.searchParams.get("q"),
    });
  } else if (method === "GET" && pathname === "/pitfalls/query") {
    pitfalls.queryString(req, res);
  } else if (method === "GET" && pathname === "/pitfalls/encode-uri") {
    pitfalls.encodeUriVsComponent(req, res);
  } else if (method === "GET" && pathname === "/pitfalls/path") {
    pitfalls.pathSegment(req, res);
  } else if (method === "GET" && pathname === "/pitfalls/decode") {
    pitfalls.decoding(req, res);
  } else if (method === "GET" && pathname === "/pitfalls/headers") {
    pitfalls.headers(req, res);
  } else if (method === "GET" && pathname === "/pitfalls/not-encoded") {
    pitfalls.notEncoded(req, res);
  } else {
    sendHtml(res, 404, page("404", `<p>Nothing at <code>${escapeHtml(pathname)}</code></p>`));
  }
}

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
