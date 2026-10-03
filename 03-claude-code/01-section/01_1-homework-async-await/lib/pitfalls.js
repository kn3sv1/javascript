// Each exported function is one route: /pitfalls/<name>.
// Every route shows the WRONG way (❌) next to the RIGHT way (✅) and prints
// what actually happened, so you can see the difference in the browser.

import fs from "fs/promises";
import path from "path";

// PITFALL: the global setTimeout is callback based - `await setTimeout(fn, 100)`
// does not wait. "timers/promises" has a version that returns a promise.
import { setTimeout as sleep } from "timers/promises";

import { readData, withLock } from "./database.js";
import { sendHtml, page, escapeHtml } from "./respond.js";

const ROOT_DIR = path.join(import.meta.dirname, "..");
const TMP_DIR = path.join(ROOT_DIR, "tmp");
const DATA_FILE = path.join(ROOT_DIR, "data.json");
const MISSING_FILE = path.join(ROOT_DIR, "this-file-does-not-exist.txt");

function report(res, title, explanation, lines) {
  sendHtml(
    res,
    200,
    page(
      title,
      `<div class="explanation">${explanation}</div>
       <pre>${escapeHtml(lines.join("\n"))}</pre>
       <p><a href="/">&larr; back to all pitfalls</a></p>`,
    ),
  );
}

// ===========================================================================
// 1. Forgetting `await`
// ===========================================================================
async function forgotAwait(req, res) {
  const lines = [];

  // ❌ No await: `messages` is a pending Promise, not the array from the file.
  //    No error is thrown - the code just silently works with the wrong thing.
  const messages = readData();
  lines.push("❌ const messages = readData();");
  lines.push(`   typeof messages            -> ${typeof messages}`);
  lines.push(`   messages instanceof Promise -> ${messages instanceof Promise}`);
  lines.push(`   Array.isArray(messages)    -> ${Array.isArray(messages)}`);
  lines.push(`   messages.length            -> ${messages.length}`);
  lines.push(`   JSON.stringify(messages)   -> ${JSON.stringify(messages)}`);
  lines.push(`   if (messages) ...          -> ${Boolean(messages)}  (a Promise is ALWAYS truthy!)`);

  // ✅ With await we get the real value. (Awaiting the same promise later is fine.)
  const realMessages = await messages;
  lines.push("");
  lines.push("✅ const messages = await readData();");
  lines.push(`   Array.isArray(messages)    -> ${Array.isArray(realMessages)}`);
  lines.push(`   messages.length            -> ${realMessages.length}`);

  report(
    res,
    "Pitfall: forgetting await",
    `<p>Calling an async function without <code>await</code> gives you a <b>Promise</b>.
     The worst part: <code>if (promise)</code> is always <code>true</code>, so checks like
     <code>if (await isAdmin(user))</code> written as <code>if (isAdmin(user))</code> let everyone in.</p>`,
    lines,
  );
}

// ===========================================================================
// 2. async callback inside forEach
// ===========================================================================
async function writeNote(dir, name) {
  await sleep(100); // pretend the disk is slow
  await fs.writeFile(path.join(dir, name), `note ${name}`);
}

async function forEachLoop(req, res) {
  const names = ["a.txt", "b.txt", "c.txt"];
  const lines = [];

  const badDir = path.join(TMP_DIR, "foreach-bad");
  const seqDir = path.join(TMP_DIR, "foreach-sequential");
  const parDir = path.join(TMP_DIR, "foreach-parallel");
  for (const dir of [badDir, seqDir, parDir]) {
    await fs.rm(dir, { recursive: true, force: true });
    await fs.mkdir(dir, { recursive: true });
  }

  // ❌ forEach calls the async callback and THROWS AWAY the promise it returns.
  //    Nothing waits for the writes. Also: if a callback rejects, nobody catches it
  //    -> "unhandled rejection" -> Node crashes the whole server. That's why
  //    we have to put a try/catch inside the callback itself.
  names.forEach(async (name) => {
    try {
      await writeNote(badDir, name);
    } catch (err) {
      console.error("forEach write failed:", err);
    }
  });
  const afterForEach = await fs.readdir(badDir);
  lines.push("❌ names.forEach(async (name) => await writeNote(name))");
  lines.push(`   files right after the loop: [${afterForEach}]  (${afterForEach.length} of 3)`);

  // ✅ for...of waits for each step - sequential (one after another).
  let start = Date.now();
  for (const name of names) {
    await writeNote(seqDir, name);
  }
  const afterForOf = await fs.readdir(seqDir);
  lines.push("");
  lines.push("✅ for (const name of names) await writeNote(name)");
  lines.push(`   files: [${afterForOf}]  took ~${Date.now() - start} ms (sequential)`);

  // ✅ map + Promise.all - parallel (all start at once, wait for all).
  start = Date.now();
  await Promise.all(names.map((name) => writeNote(parDir, name)));
  const afterAll = await fs.readdir(parDir);
  lines.push("");
  lines.push("✅ await Promise.all(names.map((name) => writeNote(name)))");
  lines.push(`   files: [${afterAll}]  took ~${Date.now() - start} ms (parallel)`);

  // Same problem with .map without Promise.all, .filter(async ...), .some(async ...):
  // array methods don't know about promises. `names.filter(async () => false)`
  // keeps EVERY item, because a Promise is truthy.

  report(
    res,
    "Pitfall: async inside forEach",
    `<p><code>forEach</code> does not wait for async callbacks. Use <code>for...of</code>
     when order matters, or <code>Promise.all(array.map(...))</code> when it doesn't.</p>`,
    lines,
  );
}

// ===========================================================================
// 3. Accidentally sequential (slow) code
// ===========================================================================
async function readSlowly(file, ms) {
  await sleep(ms); // pretend it's a slow disk / network
  return fs.readFile(file, "utf-8");
}

async function sequentialVsParallel(req, res) {
  const lines = [];

  // ❌ Three INDEPENDENT reads, but each await blocks the next one from starting.
  let start = Date.now();
  const a = await readSlowly(DATA_FILE, 300);
  const b = await readSlowly(DATA_FILE, 300);
  const c = await readSlowly(DATA_FILE, 300);
  lines.push("❌ const a = await read(); const b = await read(); const c = await read();");
  lines.push(`   took ~${Date.now() - start} ms  (300 + 300 + 300)`);

  // ✅ Start all three, then wait for all of them together.
  start = Date.now();
  const [a2, b2, c2] = await Promise.all([
    readSlowly(DATA_FILE, 300),
    readSlowly(DATA_FILE, 300),
    readSlowly(DATA_FILE, 300),
  ]);
  lines.push("");
  lines.push("✅ const [a, b, c] = await Promise.all([read(), read(), read()]);");
  lines.push(`   took ~${Date.now() - start} ms  (max of 300, 300, 300)`);
  lines.push(`   same results: ${a === a2 && b === b2 && c === c2}`);

  // PITFALL inside the fix: don't do this to "run in parallel":
  //
  //   const pa = read(); const pb = read();
  //   const a = await pa;   // <- while we wait here...
  //   const b = await pb;   // ...pb may already have rejected with nobody listening
  //                         //    = unhandled rejection = crash.
  //
  // Promise.all listens to all promises from the start, so use it instead.
  //
  // Only use sequential awaits when step 2 NEEDS the result of step 1:
  //   const user = await getUser(id);
  //   const orders = await getOrders(user.email);

  report(
    res,
    "Pitfall: sequential when it could be parallel",
    `<p>Each <code>await</code> pauses the function. If the operations don't depend on each
     other, start them together with <code>Promise.all</code>.</p>`,
    lines,
  );
}

// ===========================================================================
// 4. `return promise` vs `return await promise` inside try/catch
// ===========================================================================
async function readConfigWrong() {
  try {
    // ❌ The promise is returned immediately; the function leaves the try block
    //    BEFORE the file read fails. The catch below never runs.
    return fs.readFile(MISSING_FILE, "utf-8");
  } catch (err) {
    return "default config (from catch)";
  }
}

async function readConfigRight() {
  try {
    // ✅ await keeps us inside the try block until the read finishes or fails.
    return await fs.readFile(MISSING_FILE, "utf-8");
  } catch (err) {
    return "default config (from catch)";
  }
}

async function tryCatch(req, res) {
  const lines = [];

  let wrongResult;
  try {
    wrongResult = await readConfigWrong();
  } catch (err) {
    wrongResult = `REJECTED to the caller anyway: ${err.code}`;
  }
  lines.push("❌ try { return fs.readFile(missing) } catch { return default }");
  lines.push(`   result -> ${wrongResult}`);

  const rightResult = await readConfigRight();
  lines.push("");
  lines.push("✅ try { return await fs.readFile(missing) } catch { return default }");
  lines.push(`   result -> ${rightResult}`);

  // Same family of bug - try/catch around a call WITHOUT await catches nothing:
  //
  //   try {
  //     fs.readFile(MISSING_FILE);       // no await -> rejects later
  //   } catch (err) { ... }              // never runs -> unhandled rejection -> crash

  report(
    res,
    "Pitfall: return vs return await in try/catch",
    `<p>A <code>try/catch</code> only catches a rejected promise if you <code>await</code> it
     <b>inside</b> the <code>try</code> block.</p>`,
    lines,
  );
}

// ===========================================================================
// 5. Promise.all fails fast - Promise.allSettled doesn't
// ===========================================================================
async function allVsAllSettled(req, res) {
  const lines = [];
  const files = [DATA_FILE, MISSING_FILE, DATA_FILE];

  // ❌ (when you want partial results) - one failure rejects the whole thing
  //    and the two successful reads are thrown away.
  try {
    await Promise.all(files.map((file) => fs.readFile(file, "utf-8")));
    lines.push("❌ Promise.all -> all good");
  } catch (err) {
    lines.push("❌ Promise.all([ok, missing, ok])");
    lines.push(`   rejected with ${err.code} - results of the 2 good files are lost`);
  }

  // ✅ allSettled waits for every promise and tells you what happened to each.
  const results = await Promise.allSettled(files.map((file) => fs.readFile(file, "utf-8")));
  lines.push("");
  lines.push("✅ Promise.allSettled([ok, missing, ok])");
  results.forEach((result, i) => {
    const detail =
      result.status === "fulfilled" ? `${result.value.length} chars` : result.reason.code;
    lines.push(`   [${i}] ${result.status.padEnd(9)} ${detail}`);
  });

  report(
    res,
    "Pitfall: Promise.all vs Promise.allSettled",
    `<p><code>Promise.all</code> is right when you need <b>everything</b> (one failure = whole
     operation failed). Use <code>Promise.allSettled</code> when partial success is OK.</p>`,
    lines,
  );
}

// ===========================================================================
// 6. Race condition: read-modify-write on a file
// ===========================================================================
const COUNTER_FILE = path.join(TMP_DIR, "counter.txt");

async function readCounter() {
  try {
    return Number.parseInt(await fs.readFile(COUNTER_FILE, "utf-8"), 10) || 0;
  } catch (err) {
    if (err.code === "ENOENT") return 0;
    throw err;
  }
}

async function incrementCounter() {
  const value = await readCounter();
  await sleep(10); // some "work" between read and write - other requests run here
  await fs.writeFile(COUNTER_FILE, String(value + 1));
}

async function raceCondition(req, res) {
  const lines = [];
  const times = 20;
  await fs.mkdir(TMP_DIR, { recursive: true });

  // ❌ 20 "requests" increment the counter at the same time.
  //    They all read 0 before anyone writes, so most increments are lost.
  await fs.writeFile(COUNTER_FILE, "0");
  await Promise.all(Array.from({ length: times }, () => incrementCounter()));
  lines.push(`❌ ${times} parallel increments without a lock`);
  lines.push(`   counter = ${await readCounter()}  (expected ${times})`);

  // ✅ Same 20 increments, but each read-modify-write waits for the previous one.
  await fs.writeFile(COUNTER_FILE, "0");
  await Promise.all(Array.from({ length: times }, () => withLock(incrementCounter)));
  lines.push("");
  lines.push(`✅ ${times} parallel increments with withLock()`);
  lines.push(`   counter = ${await readCounter()}  (expected ${times})`);

  // Note: withLock() lives in memory, so it only protects ONE Node process.
  // With several processes/servers you need a real database (transactions).

  report(
    res,
    "Pitfall: race condition (lost updates)",
    `<p>JavaScript runs one thing at a time, but every <code>await</code> lets other requests
     run in between. "Read file &rarr; change &rarr; write file" from two requests at once loses data.
     <code>saveData()</code> in <code>lib/database.js</code> uses the same lock.</p>`,
    lines,
  );
}

// ===========================================================================
// 7. Fire-and-forget (no await at all)
// ===========================================================================
const LOG_FILE = path.join(TMP_DIR, "visits.log");

async function appendLog(line) {
  await sleep(50);
  await fs.appendFile(LOG_FILE, `${line}\n`);
}

async function readLog() {
  try {
    return await fs.readFile(LOG_FILE, "utf-8");
  } catch (err) {
    if (err.code === "ENOENT") return "";
    throw err;
  }
}

async function fireAndForget(req, res) {
  const lines = [];
  const id = Date.now();
  await fs.mkdir(TMP_DIR, { recursive: true });

  // ❌ Started, never awaited. The code continues before the line is written,
  //    and if appendLog() rejects, it's an unhandled rejection -> server crash.
  appendLog(`not-awaited ${id}`);
  const logAfterNoAwait = await readLog();
  lines.push("❌ appendLog(...)           // no await");
  lines.push(`   line is in the file right after? ${logAfterNoAwait.includes(`not-awaited ${id}`)}`);

  // ✅ Awaited - when the next line runs, the write is finished.
  await appendLog(`awaited ${id}`);
  const logAfterAwait = await readLog();
  lines.push("");
  lines.push("✅ await appendLog(...)");
  lines.push(`   line is in the file right after? ${logAfterAwait.includes(`awaited ${id}`)}`);

  // ✅ If you REALLY want background work (e.g. send the response first, log later),
  //    make it explicit and catch its errors yourself - an async IIFE with try/catch:
  (async () => {
    try {
      await appendLog(`background ${id}`);
    } catch (err) {
      console.error("Background log failed:", err);
    }
  })();
  lines.push("");
  lines.push("✅ (async () => { try { await appendLog(...) } catch (err) { ... } })();");
  lines.push("   runs in the background, but can never crash the server");

  lines.push("");
  lines.push("Last lines of tmp/visits.log:");
  lines.push(...logAfterAwait.trim().split("\n").slice(-4).map((l) => `   ${l}`));

  report(
    res,
    "Pitfall: fire-and-forget",
    `<p>A call without <code>await</code> is not "faster" - it's just not finished yet, and
     its errors have nowhere to go.</p>`,
    lines,
  );
}

// ===========================================================================
// 8. await does NOT make blocking code non-blocking
// ===========================================================================
async function blocking(req, res) {
  const mode = new URL(req.url, "http://localhost").searchParams.get("mode");
  const ms = 3000;
  const start = Date.now();

  if (mode === "sync") {
    // ❌ A busy loop (or fs.readFileSync, a huge JSON.parse, heavy math...) blocks the
    //    ONE thread Node has. Being inside an async function changes nothing:
    //    no other request is answered for 3 seconds.
    while (Date.now() - start < ms) {
      // burning CPU
    }
  } else {
    // ✅ Waiting on a timer / file / network gives the thread back to Node,
    //    other requests are served while this one waits.
    await sleep(ms);
  }

  report(
    res,
    `Pitfall: blocking code (mode=${mode === "sync" ? "sync" : "async"})`,
    `<p>Open <a href="/pitfalls/blocking?mode=sync" target="_blank">?mode=sync</a> and then
     quickly <a href="/messages" target="_blank">/messages</a> in another tab: /messages hangs
     until the busy loop is done. Try the same with
     <a href="/pitfalls/blocking?mode=async" target="_blank">?mode=async</a>: /messages opens instantly.</p>`,
    [`finished after ${Date.now() - start} ms`],
  );
}

export {
  forgotAwait,
  forEachLoop,
  sequentialVsParallel,
  tryCatch,
  allVsAllSettled,
  raceCondition,
  fireAndForget,
  blocking,
};
