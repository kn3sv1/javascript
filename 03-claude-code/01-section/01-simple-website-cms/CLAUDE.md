# CLAUDE.md

Rules for working on this project: a simple website CMS built with plain Node.js.

## Project overview

- `index.js` is the main server file. It uses Node's built-in `http` module (no web framework).
- `lib/` holds helper modules:
  - `lib/database.js` reads and writes JSON data.
  - `lib/upload.js` handles file uploads with multer.
- `database/` is where the JSON data files are stored.
- `uploads/` is where uploaded files are stored, with one subfolder per upload type (for example `uploads/doctors/`, `uploads/cats/`).
- `public/` holds static files (CSS, browser JS, images, HTML).

Run the project:

```bash
npm start     # node index.js
npm run dev   # nodemon index.js (auto-restart on changes)
```

## General rules

1. **No TypeScript.** Write plain JavaScript (`.js` files) only.
2. **No frameworks.** Do not add Express, Koa, Fastify, React, Vue, or any other framework or large library. Use Node.js built-in modules (`http`, `fs`, `path`, `url`, `crypto`, ...) wherever possible. The only allowed upload library is `multer`.
3. **Ask before adding a new npm package.** Prefer built-in Node.js features.
4. **Keep the code beginner-friendly:**
   - Use simple, readable code. Avoid clever one-liners and advanced patterns.
   - Use clear, descriptive names for variables and functions.
   - Keep functions small and focused on one task.
   - Use `async`/`await` instead of long promise chains or nested callbacks.
   - Add short comments that explain *why* something is done when it is not obvious.
   - Handle errors with simple `try`/`catch` blocks and return clear error messages.

## Modules: use ES6 `import` / `export`

- Use `import` / `export` instead of `require` / `module.exports` wherever possible.
- `package.json` must have `"type": "module"` for this to work.
- In ES modules `__dirname` does not exist. Build it like this:

```js
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

- Always include the `.js` extension in local imports:

```js
import { readData, saveData } from "./lib/database.js";
```

## Storing data: `lib/database.js`

- All data is stored in **JSON files** inside the `database/` folder in the project root.
- **All reading and writing of JSON files must go through `lib/database.js`.** Do not use `fs` to read or write JSON data directly from `index.js` or other files.
- Use a separate JSON file for each type of data, for example:
  - `database/doctors.json`
  - `database/pages.json`
- When a new type of data is needed, add methods for it to `lib/database.js` (for example `readDoctors()`, `saveDoctor()`, `updateDoctor()`, `deleteDoctor()`). Reuse shared helper functions (like a generic "read JSON file" / "write JSON file" helper) instead of copying the same code.
- If a JSON file does not exist yet, treat it as an empty list (`[]`) instead of crashing.
- Save JSON in a readable format: `JSON.stringify(data, null, 2)`.

## Uploading files: `lib/upload.js`

- All file uploads use **multer**, configured only in `lib/upload.js`.
- Each kind of upload has its own subfolder inside `uploads/` (for example `uploads/doctors/`, `uploads/cats/`).
- When a new kind of upload is needed, add a new upload folder and a new exported upload handler to `lib/upload.js`, following the existing pattern (e.g. `uploadDoctorPhoto`, `uploadCatPhoto`).
- Make sure the new folder exists (add a `.gitkeep` file inside it so git tracks the empty folder).
- The form field name for the file is `"file"` unless there is a good reason to change it.
- Do not save uploaded files anywhere outside the `uploads/` folder.
