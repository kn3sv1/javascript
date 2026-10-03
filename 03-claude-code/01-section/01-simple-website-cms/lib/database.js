const fs = require("fs/promises");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data.json");

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

async function saveData(data) {
  const entries = await readData();
  entries.push(data);
  await fs.writeFile(DB_PATH, JSON.stringify(entries, null, 2));
}

module.exports = {
  saveData,
  readData,
};