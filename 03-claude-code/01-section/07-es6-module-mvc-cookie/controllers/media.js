import { mediaView } from "../views/media.js";
import Busboy from "busboy";
import path from "node:path";
import fs from "node:fs";

const uploadsDir = path.join(import.meta.dirname, "../public/uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

export function getMediaForm(req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(mediaView({ user: req.user }));
}

export async function getFilesFromUploads(req, res) {
  try {
    // Read ?name=... from the URL, e.g. /api/media?name=gr
    const url = new URL(req.url, `http://${req.headers.host}`);
    const nameFilter = (url.searchParams.get("name") ?? "").toLowerCase();

    // withFileTypes: true gives objects that can tell files from folders
    const entries = await fs.promises.readdir(uploadsDir, {
      withFileTypes: true,
    });

    const files = entries
      // keep real files only: skip folders and unfinished "tmp-" uploads
      .filter((entry) => entry.isFile() && !entry.name.startsWith("tmp-"))
      // keep files whose name starts with the filter (ignoring upper/lower case);
      // an empty filter matches every file, because "abc".startsWith("") is true
      .filter((entry) => entry.name.toLowerCase().startsWith(nameFilter))
      // same shape as the upload response
      .map((entry) => ({
        file_name: entry.name,
        url: `/uploads/${encodeURIComponent(entry.name)}`,
      }));

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(files));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "Could not read uploads" }));
  }
}

export function postMediaForm(req, res) {
  const fields = {};
  let fileInfo = null;
  let writePromise = null;

  const busboy = Busboy({ headers: req.headers });

  busboy.on("field", (fieldname, value) => {
    fields[fieldname] = value;
  });

  busboy.on("file", (fieldname, file, info) => {
    if (!info.filename) {
      file.resume(); // no file chosen: discard the empty part
      return;
    }

    const tempPath = path.join(
      uploadsDir,
      `tmp-${Date.now()}-${path.basename(info.filename)}`,
    );

    fileInfo = {
      fieldname,
      info,
      tempPath,
    };

    const writeStream = fs.createWriteStream(tempPath);

    writePromise = new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
      file.on("error", reject);
    });

    file.pipe(writeStream);
  });

  busboy.on("close", async () => {
    try {
      if (!fileInfo || !fileInfo.info.filename) {
        res.writeHead(400);
        return res.end("No file uploaded");
      }

      await writePromise;

      const extension = path.extname(fileInfo.info.filename);
      const fileName = path.parse(fileInfo.info.filename).name;
      const baseName = fields.name ? path.basename(fields.name) : fileName;

      const finalPath = path.join(uploadsDir, baseName + extension);

      await fs.promises.rename(fileInfo.tempPath, finalPath);

      // Reply with JSON so the browser script can show the uploaded image
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(
        JSON.stringify({
          message: "Upload successful",
          url: `/uploads/${encodeURIComponent(baseName + extension)}`,
          file_name: `${baseName + extension}`, 
        }),
      );
    } catch (error) {
      console.error(error);
      res.writeHead(500);
      res.end("Upload failed");
    }
  });

  req.pipe(busboy);
}
