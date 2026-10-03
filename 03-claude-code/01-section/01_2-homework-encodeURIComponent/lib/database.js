import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(import.meta.dirname, "..", "data.json");

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

async function saveData(person) {
  const people = await readData();
  people.push(person);
  await fs.writeFile(DB_PATH, JSON.stringify(people, null, 2));
}

async function findByName(name) {
  const people = await readData();
  return people.find((p) => p.name === name);
}

export {
  readData,
  saveData,
  findByName,
};
