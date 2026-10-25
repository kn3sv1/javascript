import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { serveStatic } from "./lib/staticFile.js";
import {
  sendHtml,
  homePage,
  notFoundPage,
  showErrorPage,
} from "./lib/pages.js";
import { UPLOAD_DIR } from "./lib/config.js";
import { uploadCoffee } from "./lib/upload.js";
// import { readPeople } from "./lib/database.js";

// console.log( await readPeople());


const PUBLIC_DIR = path.join(import.meta.dirname, "public");
// const UPLOADS_DIR = path.join(import.meta.dirname, "uploads");
// console.log("UPLOADS_DIR: " + UPLOADS_DIR);

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
    return serveStatic(req, res, UPLOAD_DIR, "/uploads/");
  }
  if (req.method === "POST" && req.url === "/upload") {
    uploadCoffee(req, res, (err) => {
      if (err) {
        //return showErrorPage(res, err);
        return res
          .writeHead(400, {
            "Content-Type": "application/json",
          })
          .end(JSON.stringify({ error: err.message }));
      }
      if (!req.file) {
        return res
          .writeHead(400, {
            "Content-Type": "application/json",
          })
          .end(JSON.stringify({ error: "Image is required" }));
      }

      // console.log(req.file.filename);
      // console.log(req.file);

      // res.writeHead(200, { "Content-Type": "text/html" });
      // res.end("Received uploaded file!");
      // redirect(res, '/doctors');

      res.writeHead(201, {
        "Content-Type": "application/json",
      });

      res.end(
        JSON.stringify({
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size,
        }),
      );
    });

    return;
  }
  //console.log("pathname: " + pathname);

  // all dynamic routes always go after static files.
  if (pathname === "/") {
    return homePage(res);
  }

  notFoundPage(res);
}

export const server = http.createServer((req, res) => {
  router(req, res);
});


