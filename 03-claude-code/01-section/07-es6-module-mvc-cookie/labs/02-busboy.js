import path from "node:path";
import fs from "node:fs";
import Busboy from "busboy";

const uploadsDir = path.join(import.meta.dirname, "../public/uploads");

//  node  labs/02-busboy.js

// we use await here to get the value (array) not to return just the promise.

// ===== 1. What a browser sends when you submit a form with a file =====
// enctype="multipart/form-data" splits the body into PARTS.
// Each part starts with "--" + boundary. The last boundary ends with "--".
// The boundary is any random string; the browser picks one and puts it
// in the Content-Type header so the server knows how to split the body.
const boundary = "----MyBoundary123";

// A real (tiny) PNG image. readFileSync without "utf8" returns a Buffer:
// raw bytes, because an image is binary data, not text.
const image = fs.readFileSync(
  path.join(import.meta.dirname, "../tests/fixtures/car.png"),
);

// Everything BEFORE the image bytes (text)
const head =
  `--${boundary}\r\n` +
  `Content-Disposition: form-data; name="name"\r\n` + // text input name="name"
  `\r\n` +
  `holiday\r\n` + //                                     its value
  `--${boundary}\r\n` +
  `Content-Disposition: form-data; name="file"; filename="car.png"\r\n` + // file input
  `Content-Type: image/png\r\n` +
  `\r\n`; //                                             blank line, then the file's bytes

// Everything AFTER the image bytes (text)
const tail = `\r\n--${boundary}--\r\n`; // "--" at the end = no more parts

// Glue text + image bytes + text into ONE Buffer.
// (Adding the image to a string with + would turn its bytes into broken text.)
const body = Buffer.concat([Buffer.from(head), image, Buffer.from(tail)]);

// In a real server these headers come from req.headers
const headers = {
  "content-type": `multipart/form-data; boundary=${boundary}`,
};

// ===== 2. Create the parser =====
// Busboy reads the boundary from the content-type header
const busboy = Busboy({ headers });

// ===== 3. Listen for events (BEFORE sending any data) =====

// A text field was found: <input type="text" name="name">
busboy.on("field", (fieldname, value, info) => {
  console.log("FIELD:", fieldname, "=", value);
  // info: { nameTruncated, valueTruncated, encoding, mimeType }
});

// A file was found: <input type="file" name="file">
busboy.on("file", (fieldname, file, info) => {
  // info: { filename, encoding, mimeType }
  console.log("FILE:", fieldname, info);

  // "file" is a STREAM: the bytes come in chunks, not all at once.
  // You MUST read it (or call file.resume()), otherwise busboy gets stuck.
  file.on("data", (chunk) => {
    // An image isn't text, so print the bytes instead of chunk.toString().
    // A PNG always starts with: 89 50 4e 47 ("\x89PNG")
    console.log(`  got ${chunk.length} bytes:`, chunk.subarray(0, 8));
  });

  file.on("end", () => {
    console.log("  file finished");
  });

  // Save the same stream to disk: pipe = "send every chunk into this file"
  const savePath = path.join(uploadsDir, "lab-" + info.filename);
  // SECRET IS NOT "file.on" BUT "file.pipe"
  file.pipe(fs.createWriteStream(savePath));
  console.log("  SAVING TO", savePath);
});

// Everything has been parsed
busboy.on("close", () => {
  console.log("CLOSE: all parts parsed");
});

busboy.on("error", (error) => {
  console.error("ERROR:", error.message);
});

// ===== 4. Send the data into busboy =====
// Busboy is a writable stream. In the server we do req.pipe(busboy);
// here we just write our hand-made body and end.
busboy.end(body);

// Things to try:
// - add a second text field part and see a second "field" event
// - remove the file part: no "file" event, only "field" and "close"
// - change the boundary in the body only: busboy can't split the parts
//   any more, so no "field"/"file" events fire and you get
//   "ERROR: Unexpected end of form"
