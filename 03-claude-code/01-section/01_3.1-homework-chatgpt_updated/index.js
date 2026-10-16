import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { serveStatic } from "./lib/staticFile.js";
import {
  sendHtml,
  homePage,
  notFoundPage,
  personPage,
  adminPage,
} from "./lib/pages.js";
import { readPeople, savePeople } from "./lib/database.js";
import { getFormData } from "./lib/formData.js";

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

  const people = await readPeople();

  // all dynamic routes always go after static files.
  if (pathname === "/") {
    return homePage(res, people);
  }

  // <http://localhost:3000/people/angie>
  // <http://localhost:3000/people/roma>
  if (pathname.startsWith("/people/")) {
    const slug = pathname.slice("/people/".length); // "/people/angie" → "angie"
    const person = people.find((p) => p.slug === slug);

    if (!person) {
      return notFoundPage(res, people); // e.g. /people/bob → no such person
    }
    return personPage(res, person, people);
  }

  // form from the admin page is sent here
  if (pathname === "/admin/people" && req.method === "POST") {
    const formData = await getFormData(req, res);

    // trim() removes spaces at the start and end
    const name = (formData.name || "").trim();
    const slug = (formData.slug || "").trim().toLowerCase();
    const bio = (formData.bio || "").trim();
    const avatar =
      (formData.avatar || "").trim() || "/uploads/people/roma/avatar.svg";

    // check the data on the server too
    if (!name || !slug || !bio) {
      return adminPage(res, people, "Name, slug and bio are required.");
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return adminPage(res, people, "Slug can only use a-z, 0-9 and -");
    }
    if (people.some((p) => p.slug === slug)) {
      return adminPage(res, people, `Slug "${slug}" is already taken.`);
    }

    people.push({ slug, name, bio, avatar });
    await savePeople(people);

    // send the browser back to /admin
    res.writeHead(303, { Location: "/admin" });
    return res.end();
  }

  // http://localhost:3000/admin
  if (pathname === "/admin") {
    return adminPage(res, people);
  }

  notFoundPage(res, people);
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
