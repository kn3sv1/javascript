// Stores calculation history in a JSON file.
// fs/promises gives us Promise-based file functions, so we can use await
// instead of callbacks.
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { HISTORY_LIMIT } from "./constants.js";

// In ES modules there is no __dirname, so we build it ourselves.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_DIR = path.join(__dirname, "..", "database");
const DB_PATH = path.join(DB_DIR, "history.json");

// Called once at startup (see index.js).
export async function initDatabase() {
  // recursive: true -> no error if the folder already exists
  await fs.mkdir(DB_DIR, { recursive: true });
}

export async function getHistory() {
  try {
    const content = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    // The file does not exist yet -> no history.
    if (err.code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

export async function addToHistory(entry) {
  const history = await getHistory();
  history.unshift({ ...entry, createdAt: new Date().toISOString() });

  await fs.writeFile(DB_PATH, JSON.stringify(history.slice(0, HISTORY_LIMIT), null, 2));
}

export async function clearHistory() {
  await fs.writeFile(DB_PATH, "[]");
}
