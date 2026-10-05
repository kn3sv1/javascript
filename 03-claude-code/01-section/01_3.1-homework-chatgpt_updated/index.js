import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { serveStatic } from "./lib/staticFile.js";
import {
  sendHtml,
  homePage,
  angiePage,
  romaPage,
  notFoundPage,
  personPage,
} from "./lib/pages.js";
import { readPeople } from "./lib/database.js";

console.log(await readPeople());

const PORT = 3000;
const PUBLIC_DIR = path.join(import.meta.dirname, "public");
const UPLOADS_DIR = path.join(import.meta.dirname, "uploads");
console.log("UPLOADS_DIR: " + UPLOADS_DIR);

async function router(req, res) {
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

  // all dynamic routes always go after static files.
  if (pathname === "/") {
    return homePage(res);
  }

  // <http://localhost:3000/people/angie>
  // <http://localhost:3000/people/roma>
  if (pathname.startsWith("/people/")) {
    const slug = pathname.slice("/people/".length); // "/people/angie" → "angie"
    const people = await readPeople();
    const person = people.find((p) => p.slug === slug);

    if (!person) {
      return notFoundPage(res); // e.g. /people/bob → no such person
    }
    return personPage(res, person);
  }

  notFoundPage(res);
}

const server = http.createServer(async (req, res) => {
  try {
    await router(req, res);
  } catch (err) {
    console.error(err);
    sendHtml(res, 500, "Internal server error");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
