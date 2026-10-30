// controllers/static.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif":  "image/gif",
  ".svg":  "image/svg+xml",
  ".webp": "image/webp",
  ".ico":  "image/x-icon",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".txt":  "text/plain; charset=utf-8",
  ".pdf":  "application/pdf",
};
console.log("PUBLIC_DIR:", PUBLIC_DIR);

export function serveStatic(req, res, pathname) {
  // Only GET/HEAD make sense for static files
  if (req.method !== "GET" && req.method !== "HEAD") return false;

  // Decode %20 etc. Malformed encoding -> not ours
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return false;
  }

  // Resolve to an absolute path and make sure it stays inside PUBLIC_DIR
  const filePath = path.join(PUBLIC_DIR, decoded);
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) return false;

  // Must exist and be a regular file (not a directory)
  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch {
    return false;
  }
  if (!stat.isFile()) return false;

  const ext = path.extname(filePath).toLowerCase();
  res.statusCode = 200;
  res.setHeader("Content-Type", MIME_TYPES[ext] ?? "application/octet-stream");
  res.setHeader("Content-Length", stat.size);

  if (req.method === "HEAD") {
    res.end();
    return true;
  }

  // Stream the file instead of loading it all into memory (good for images)
  const stream = fs.createReadStream(filePath);
  stream.on("error", () => {
    res.statusCode = 500;
    res.end("Internal Server Error");
  });
  stream.pipe(res);
  return true;
}
