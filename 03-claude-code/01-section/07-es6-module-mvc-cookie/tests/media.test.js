// ===== Integration tests for the media API =====
// These tests send real HTTP requests to the app (router -> controller -> disk)
// using supertest. Run them with: npm test

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import request from "supertest";
import { server } from "../server.js";

const publicDir = path.join(import.meta.dirname, "../public");
const uploadsDir = path.join(publicDir, "uploads");

// Every file these tests create has this unique prefix in its name,
// so we can clean up our own files without touching your real images.
const PREFIX = `test-${Date.now()}-`;

// A real (tiny) PNG image that every upload test sends
const fixturePath = path.join(import.meta.dirname, "fixtures/car.png");
// Its bytes, so we can check the saved/served file is exactly the same
const fixtureImage = fs.readFileSync(fixturePath);

// Helper: upload the fixture image through the API, like the form on /media does.
// fileName is the name the browser would send (e.g. "photo.png")
function upload(name, fileName) {
  return request(server)
    .post("/api/media")
    .field("name", name)
    .attach("file", fixturePath, fileName);
}

// Helper: names of all files in public/uploads
function filesInUploads() {
  return fs.readdirSync(uploadsDir);
}

// After ALL tests: delete every file whose name contains PREFIX
after(() => {
  for (const name of filesInUploads()) {
    if (name.includes(PREFIX)) {
      fs.rmSync(path.join(uploadsDir, name));
    }
  }
});

describe("POST /api/media (postMediaForm)", () => {
  it("saves the file under the name from the form and returns JSON", async () => {
    const res = await upload(PREFIX + "car", "photo.png");

    assert.equal(res.status, 200);
    assert.match(res.headers["content-type"], /application\/json/);
    assert.deepEqual(res.body, {
      message: "Upload successful",
      file_name: PREFIX + "car.png",
      url: "/uploads/" + encodeURIComponent(PREFIX + "car.png"),
    });

    // The file is on disk with exactly the bytes we sent
    const saved = fs.readFileSync(path.join(uploadsDir, PREFIX + "car.png"));
    assert.deepEqual(saved, fixtureImage);
  });

  it("serves the uploaded file at the returned url", async () => {
    const uploadRes = await upload(PREFIX + "served", "photo.png");

    // responseType("blob") makes supertest give us the raw bytes as a Buffer
    const res = await request(server)
      .get(uploadRes.body.url)
      .responseType("blob");

    assert.equal(res.status, 200);
    assert.equal(res.headers["content-type"], "image/png");
    assert.deepEqual(res.body, fixtureImage);
  });

  it("uses the original file name when the name field is empty", async () => {
    const res = await upload("", PREFIX + "original.png");

    assert.equal(res.status, 200);
    assert.equal(res.body.file_name, PREFIX + "original.png");
    assert.ok(fs.existsSync(path.join(uploadsDir, PREFIX + "original.png")));
  });

  it("returns 400 when no file is sent", async () => {
    const res = await request(server)
      .post("/api/media")
      .field("name", PREFIX + "nofile");

    assert.equal(res.status, 400);
    assert.equal(res.text, "No file uploaded");
  });

  it("does not let the name escape the uploads folder", async () => {
    const res = await upload("../" + PREFIX + "evil", "photo.png");

    assert.equal(res.status, 200);
    assert.equal(res.body.file_name, PREFIX + "evil.png");

    // Saved inside uploads, NOT in public/
    assert.ok(fs.existsSync(path.join(uploadsDir, PREFIX + "evil.png")));
    assert.ok(!fs.existsSync(path.join(publicDir, PREFIX + "evil.png")));
  });

  it("leaves no tmp- files behind", () => {
    const leftovers = filesInUploads().filter(
      (name) => name.startsWith("tmp-") && name.includes(PREFIX),
    );
    assert.deepEqual(leftovers, []);
  });
});

describe("GET /api/media-list (getFilesFromUploads)", () => {
  const carsFile = PREFIX + "cars-1.png";
  const bikesFile = PREFIX + "bikes-1.png";
  const tmpFile = "tmp-" + PREFIX + "unfinished.png";

  // Before these tests: create the files we will look for
  before(async () => {
    await upload(PREFIX + "cars-1", "a.png");
    await upload(PREFIX + "bikes-1", "b.png");
    // Pretend an upload was interrupted and left a temp file behind
    fs.writeFileSync(path.join(uploadsDir, tmpFile), "unfinished");
  });

  // Helper: get the list, optionally with ?name=...
  function getList(name) {
    const req = request(server).get("/api/media-list");
    return name === undefined ? req : req.query({ name });
  }

  it("returns all files as JSON when there is no filter", async () => {
    const res = await getList();

    assert.equal(res.status, 200);
    assert.match(res.headers["content-type"], /application\/json/);
    assert.ok(Array.isArray(res.body));

    // Every item has the same shape
    for (const item of res.body) {
      assert.equal(typeof item.file_name, "string");
      assert.equal(item.url, "/uploads/" + encodeURIComponent(item.file_name));
    }

    const names = res.body.map((item) => item.file_name);
    assert.ok(names.includes(carsFile));
    assert.ok(names.includes(bikesFile));
  });

  it("returns only files whose name starts with the filter", async () => {
    const res = await getList(PREFIX + "cars");

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, [
      { file_name: carsFile, url: "/uploads/" + encodeURIComponent(carsFile) },
    ]);
  });

  it("ignores upper/lower case in the filter", async () => {
    const res = await getList((PREFIX + "cars").toUpperCase());

    assert.deepEqual(
      res.body.map((item) => item.file_name),
      [carsFile],
    );
  });

  it("returns an empty array when nothing matches", async () => {
    const res = await getList(PREFIX + "nothing-matches-this");

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, []);
  });

  it("never lists unfinished tmp- files", async () => {
    const res = await getList();

    const names = res.body.map((item) => item.file_name);
    assert.ok(!names.includes(tmpFile));
  });
});
// some small example without comparing anything just to see structure.
describe("my name is angie", () => {
  it("hello from angie", async () => {
    assert.ok(true);
  });
});
