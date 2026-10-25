import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import { uploadPersonPhoto } from "./lib/upload.js";
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

// run multer and wait until the file has been read
function runUpload(req, res) {
  return new Promise((resolve, reject) => {
    uploadPersonPhoto(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

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

    // always get an array, even if the form sent only one value (a string)
    const toArray = (value) => [].concat(value || []).map((v) => v.trim());

    const tableTitle = (formData.tableTitle || "").trim();
    const columns = toArray(formData.column);

    // [row0, row1, row2] → each one is an array of 4 cells
    const rows = [0, 1, 2]
      .map((r) => toArray(formData[`row${r}`]))
      .filter((row) => row.some((cell) => cell !== "")); // skip empty rows

    let table; // stays undefined if no table was filled in

    if (tableTitle) {
      if (columns.some((column) => column === "")) {
        return adminPage(res, people, "Please fill in all 4 column names.");
      }
      if (rows.length === 0) {
        return adminPage(res, people, "Please fill in at least one row.");
      }
      table = { title: tableTitle, columns, rows };
    }

    const newPerson = { slug, name, bio, avatar };
    if (table) {
      newPerson.table = table;
    }

    people.push(newPerson);
    await savePeople(people);

    // send the browser back to /admin
    res.writeHead(303, { Location: "/admin" });
    return res.end();
  }

  // upload form from the admin page is sent here
  if (pathname === "/admin/upload" && req.method === "POST") {
    try {
      await runUpload(req, res); // fills req.body and req.file
    } catch (err) {
      if (err instanceof multer.MulterError) {
        // e.g. file bigger than 5 MB → show a message, not a 500 page
        return adminPage(res, people, `Upload failed: ${err.message}`);
      }
      throw err; // other errors → the 500 handler at the bottom
    }

    const slug = req.body.slug;
    const caption = (req.body.caption || "").trim();
    const file = req.file;

    // 1. the slug must be a real person from people.json
    const person = people.find((p) => p.slug === slug);
    if (!person) {
      return adminPage(res, people, "Please choose a person.");
    }

    // 2. a file must be chosen
    if (!file) {
      return adminPage(res, people, "Please choose a photo.");
    }

    // 3. only allow image file types
    const ext = path.extname(file.originalname).toLowerCase(); // ".jpg"
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    if (!allowed.includes(ext)) {
      return adminPage(res, people, "Only jpg, png, gif and webp are allowed.");
    }

    // 4. make a safe, unique file name
    //    "My Photo.JPG" → "1729690000000-my-photo.jpg"
    const baseName = path
      .basename(file.originalname, path.extname(file.originalname))
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-");
    const fileName = `${Date.now()}-${baseName}${ext}`;

    // 5. write the file to uploads/people/<slug>/
    const personDir = path.join(UPLOADS_DIR, "people", person.slug);
    await fs.mkdir(personDir, { recursive: true }); // create folder if missing
    await fs.writeFile(path.join(personDir, fileName), file.buffer);

    // 6. add the photo to the person's gallery in people.json
    if (!person.photos) {
      person.photos = [];
    }
    person.photos.push({
      src: `/uploads/people/${person.slug}/${fileName}`,
      caption: caption || "New photo",
    });
    await savePeople(people);

    // go to the person's page to see the new photo
    res.writeHead(303, { Location: `/people/${person.slug}` });
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
