import fs from "node:fs/promises";
import path from "node:path";

import { DATA_DIR } from "./config.js";

export async function writeJson(filename, data) {
  const filePath = path.join(DATA_DIR, filename);

  await fs.mkdir(path.dirname(filePath), {
    recursive: true
  });

  await fs.writeFile(
    filePath,
    JSON.stringify(data, null, 2),
    'utf8'
  );
}

export async function readJson(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const content = await fs.readFile(filePath, 'utf8');

  return JSON.parse(content);
}
