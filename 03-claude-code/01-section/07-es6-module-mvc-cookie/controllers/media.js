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

      res.end("Upload successful");
    } catch (error) {
      console.error(error);
      res.writeHead(500);
      res.end("Upload failed");
    }
  });

  req.pipe(busboy);
}
