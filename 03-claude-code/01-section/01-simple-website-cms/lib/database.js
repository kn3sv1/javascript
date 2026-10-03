import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "..", "database");
const PAGES_FILE = "pages.json";

// ---------- Generic JSON helpers ----------

// Reads a JSON file from the "database" folder.
// If the file does not exist yet, we return an empty list.
async function readJson(fileName) {
  try {
    const content = await fs.readFile(path.join(DB_PATH, fileName), "utf-8");
    return JSON.parse(content);
  } catch (err) {
    if (err.code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

// Writes data to a JSON file in the "database" folder (pretty formatted).
async function writeJson(fileName, data) {
  await fs.mkdir(DB_PATH, { recursive: true });
  await fs.writeFile(path.join(DB_PATH, fileName), JSON.stringify(data, null, 2));
}

// ---------- Pages ----------

// Returns all pages sorted by menu order, then by title.
export async function getPages() {
  const pages = await readJson(PAGES_FILE);
  return pages.sort((a, b) => a.menuOrder - b.menuOrder || a.title.localeCompare(b.title));
}

export async function getPageById(id) {
  const pages = await readJson(PAGES_FILE);
  return pages.find((page) => page.id === id);
}

export async function getPageBySlug(slug) {
  const pages = await readJson(PAGES_FILE);
  return pages.find((page) => page.slug === slug);
}

// Saves a new page. "pageData" contains the already validated form fields.
export async function createPage(pageData) {
  const pages = await readJson(PAGES_FILE);
  const now = new Date().toISOString();

  const page = {
    id: crypto.randomUUID(),
    ...pageData,
    createdAt: now,
    updatedAt: now,
  };

  pages.push(page);
  await writeJson(PAGES_FILE, pages);
  return page;
}

// Updates an existing page. Returns the updated page, or null if not found.
export async function updatePage(id, pageData) {
  const pages = await readJson(PAGES_FILE);
  const index = pages.findIndex((page) => page.id === id);

  if (index === -1) {
    return null;
  }

  pages[index] = {
    ...pages[index],
    ...pageData,
    updatedAt: new Date().toISOString(),
  };

  await writeJson(PAGES_FILE, pages);
  return pages[index];
}

// Deletes a page. Returns true if a page was deleted.
export async function deletePage(id) {
  const pages = await readJson(PAGES_FILE);
  const remainingPages = pages.filter((page) => page.id !== id);

  if (remainingPages.length === pages.length) {
    return false;
  }

  await writeJson(PAGES_FILE, remainingPages);
  return true;
}
