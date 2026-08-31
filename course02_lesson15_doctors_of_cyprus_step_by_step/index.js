const http = require("http");
const fs = require("fs");
const path = require("path");
const {
  homePage,
  angiePage,
  showFormPage,
  commentsPage,
  showUploadFilePage,
  showErrorPage,
} = require("./lib/pages");
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

  if (req.method === "POST" && req.url === "/submit") {
    const formData = await getFormData(req, res);
    console.log(formData);
    // maybe we want to do something here - save to JSON fle
    await saveData(formData);

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("Received!");

    return;
  }

  if (req.url === "/form") {
    showFormPage(res);
    return;
  }

  if (req.url === "/show-upload") {
    showUploadFilePage(res);
    return;
  }

  if (req.url === "/upload") {
    uploadDoctorPhoto(req, res, (err) => {
      if (err) {
        return showErrorPage(res, err);
      }

      console.log(req.file.filename);
      console.log(req.file);

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("Received uploaded file!");
    });

    return;
  }

  if (req.url === "/comments") {
    const comments = await readData();
    commentsPage(res, comments);
    return;
  }

  if (req.url === "/angie") {
    angiePage(res);
    return;
  }

  homePage(res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
