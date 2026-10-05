import fs from "node:fs/promises";
import path from "node:path";

const DB_PATH = path.join(import.meta.dirname, "..", "data.json");
const PEOPLE_PATH = path.join(import.meta.dirname, "..", "data", "people.json");

async function readData() {
  try {
    const content = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    if (err.code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

async function readPeople() {
  try {
    const content = await fs.readFile(PEOPLE_PATH, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    if (err.code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

async function saveData(data) {
  const entries = await readData();
  entries.push(data);
  await fs.writeFile(DB_PATH, JSON.stringify(entries, null, 2));
}

export { saveData, readData, readPeople };
