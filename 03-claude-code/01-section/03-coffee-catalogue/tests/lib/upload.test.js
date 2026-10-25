import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { styleText } from "node:util";
import request from "supertest";

// Must be set before server.js (and config.js) are loaded, so import them dynamically.
process.env.UPLOAD_DIR = path.resolve("test-uploads");
//console.info(`${styleText("bgGreenBright", process.env.UPLOAD_DIR)}`);
const { server } = await import("../../server.js");
const { COFFEE_UPLOAD_DIR } = await import("../../lib/upload.js");

const filesToClear = ["test-image.png"];

// we need to clean because maybe this test will not create a file so we clean
// to be sure.
beforeEach(async () => {
  await fs.mkdir(COFFEE_UPLOAD_DIR, { recursive: true });

  // Delete only the explicitly listed files.
  await Promise.all(
    filesToClear.map((filename) =>
      fs.rm(path.join(COFFEE_UPLOAD_DIR, filename), {
        force: true,
      }),
    ),
  );
});

test("uploads an image and stores it on disk", async () => {
  const filename = "test-image.png";

  // The image's binary data, ready for Supertest
  const imageBuffer = await fs.readFile(
    new URL("../fixtures/test-image.png", import.meta.url),
  );

  const response = await request(server)
    .post("/upload")
    .attach("file", imageBuffer, {
      filename,
      contentType: "image/png",
    })
    .expect(201);

  assert.equal(response.body.filename, `coffee/${filename}`);
  assert.equal(response.body.size, imageBuffer.length);

  // Confirm the file was saved in coffee folder.
  const savedPath = path.join(COFFEE_UPLOAD_DIR, filename);
  const savedImage = await fs.readFile(savedPath);


  // for styling in console for debug information.
  console.info(`${styleText("bgCyanBright", "savedPath:")} ${styleText("green", savedPath)}`);
  // we compare binary that file on disk is the same that we sent in request.
  // we compare binary means that not just file name is the same but photo inside is the same.
  // because the file name could be the same but different photo was uploaded.
  assert.deepEqual(savedImage, imageBuffer);
});
