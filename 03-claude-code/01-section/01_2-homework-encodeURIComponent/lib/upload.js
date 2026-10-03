import multer from "multer"; // CommonJS package - its module.exports becomes the default import
import path from "path";

const UPLOADS_DIR = path.join(import.meta.dirname, "..", "uploads");
const FILES_DIR = path.join(UPLOADS_DIR, "files");

// Keep spaces, #, %, & and non-ASCII letters in the name ON PURPOSE - they are
// exactly what breaks URLs. Only remove what Windows can't store and what
// could escape the folder ("../../index.js").
function safeFileName(originalname) {
  return path.basename(originalname).replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, FILES_DIR),
  filename: (req, file, cb) => cb(null, safeFileName(file.originalname)),
});

const upload = multer({
  storage,
  // PITFALL (same family as encodeURIComponent): by default multer reads the
  // file name as latin1, so "звіт.pdf" arrives as "Ð·Ð²Ñ–Ñ‚.pdf".
  defParamCharset: "utf8",
}).single("file"); // "file" - is name in FORM HTML

// multer is Express middleware: (req, res, next). Wrap it so we can `await` it.
function uploadFile(req, res) {
  return new Promise((resolve, reject) => {
    upload(req, res, (err) => (err ? reject(err) : resolve(req.file)));
  });
}

export {
  uploadFile,
  UPLOADS_DIR,
  FILES_DIR,
};
