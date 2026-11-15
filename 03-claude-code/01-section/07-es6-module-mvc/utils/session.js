import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { getCookie, setCookie, deleteCookie } from "./cookie.js";

// All sessions live in one JSON file:
// { "a1b2c3...": { "user": "Roma", "total_visits": 5, ... }, "d4e5f6...": { ... } }
const SESSIONS_PATH = path.join(import.meta.dirname, "..", "data", "sessions.json");

// Name of the cookie that holds the session id
const COOKIE_NAME = "SESSION_ID";

async function readSessions() {
  try {
    const content = await fs.readFile(SESSIONS_PATH, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    // No file yet = no sessions yet
    if (err.code === "ENOENT") {
      return {};
    }
    throw err;
  }
}

async function writeSessions(sessions) {
  await fs.writeFile(SESSIONS_PATH, JSON.stringify(sessions, null, 2));
}

// After login: create a new session and give its id to the browser
export async function createSession(res, data) {
  const sessions = await readSessions();

  // Long random id like "3f2b9c1e-...": impossible to guess
  const id = crypto.randomUUID();
  sessions[id] = data;

  await writeSessions(sessions);
  setCookie(res, COOKIE_NAME, id);
}

// On every request: find the session by the id from the cookie
// Sets req.sessionId and req.session (null if not logged in)
export async function loadSession(req) {
  req.sessionId = getCookie(req, COOKIE_NAME);
  req.session = null;

  if (req.sessionId) {
    const sessions = await readSessions();
    req.session = sessions[req.sessionId] || null;
  }
}

// Save changes made to req.session back to the file
export async function saveSession(req) {
  const sessions = await readSessions();
  sessions[req.sessionId] = req.session;
  await writeSessions(sessions);
}

// Logout: remove the session from the file and the cookie from the browser
export async function destroySession(req, res) {
  const sessions = await readSessions();
  delete sessions[req.sessionId];
  await writeSessions(sessions);

  deleteCookie(res, COOKIE_NAME);
}
