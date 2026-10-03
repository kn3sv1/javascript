// A tiny "database" = one JSON file, read and written with async/await.
//
// ---------------------------------------------------------------------------
// From .then() to await - the same function written both ways
// ---------------------------------------------------------------------------
//
//   // with .then()
//   function readData() {
//     return fs.readFile(DB_PATH, "utf-8")
//       .then((content) => JSON.parse(content))
//       .catch((err) => {
//         if (err.code === "ENOENT") return [];
//         throw err;
//       });
//   }
//
//   // with async/await (below): every `.then(x => ...)` becomes `const x = await ...`,
//   // and `.catch()` becomes an ordinary try/catch.
// ---------------------------------------------------------------------------

// PITFALL: `import fs from "fs"` gives callback-based functions. `await fs.readFile(path, cb)`
// does NOT wait for anything - readFile returns undefined, and you await undefined.
// Use the promise API: "fs/promises" (or util.promisify for old callback APIs).
import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(import.meta.dirname, "..", "data.json");

async function readData() {
  try {
    // `return await` (not just `return`) matters here - see /pitfalls/try-catch.
    const content = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    if (err.code === "ENOENT") {
      return []; // no file yet = empty database
    }
    throw err; // anything else is a real error - let the caller decide
  }
}

async function writeData(entries) {
  await fs.writeFile(DB_PATH, JSON.stringify(entries, null, 2));
}

// ---------------------------------------------------------------------------
// PITFALL: read-modify-write is NOT atomic.
//
//   const entries = await readData();   // <- request A and B both read [x]
//   entries.push(entry);                //    A has [x, a], B has [x, b]
//   await writeData(entries);           // <- whoever writes last wins, one entry is lost
//
// Every `await` is a point where other requests can run. JavaScript is single
// threaded, but async code still has race conditions. See /pitfalls/race-condition.
//
// Fix: run read-modify-write operations one after another with a simple lock.
// ---------------------------------------------------------------------------

let lastTask = Promise.resolve();

async function withLock(task) {
  const previousTask = lastTask;

  // Create a promise and keep its `resolve` so we can "release the lock" later.
  let release;
  lastTask = new Promise((resolve) => {
    release = resolve;
  });

  await previousTask; // wait for everyone in the queue before us
  try {
    return await task();
  } finally {
    release(); // always release, even if task() threw - otherwise the queue is stuck forever
  }
}

async function saveData(entry) {
  // Plain `return withLock(...)` (without await) is fine HERE because there is
  // no try/catch around it in this function - the caller gets the same promise.
  return withLock(async () => {
    const entries = await readData();
    entries.push(entry);
    await writeData(entries);
    return entry;
  });
}

export {
  readData,
  saveData,
  withLock,
};
