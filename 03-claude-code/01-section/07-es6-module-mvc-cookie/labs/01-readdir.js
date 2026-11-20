import path from "node:path";
import fs from "node:fs";

const uploadsDir = path.join(import.meta.dirname, "../public/uploads");

//  node  labs/01-readdir.js

// we use await here to get the value (array) not to return just the promise.
const entries = await fs.promises.readdir(uploadsDir, {
  withFileTypes: true,
});

//console.log(entries);
// how I know that the property name exists?
// "readdir" - ctrl + click on this name and you will jump to typeScript file declaration
// for types and you will see what methods exist. That is why I should know very well typeScript
// otherwise I will not be able to read code efficiently especially methods and properties for unknown Classes or someone elses code.
// for (let filename of entries) {
//   console.log(filename.name);
// }

const files = entries
  // keep real files only: skip folders and unfinished "tmp-" uploads
  .filter((entry) => entry.isFile() && !entry.name.startsWith("tmp-"))
  // same shape as the upload response
  .map((entry) => ({
    file_name: entry.name,
    url: `/uploads/${encodeURIComponent(entry.name)}`,
  }));
console.log(files);
