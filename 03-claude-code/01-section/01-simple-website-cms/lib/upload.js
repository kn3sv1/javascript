import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

// The only folders photos can be uploaded to.
// To add a new folder, add its name here and create uploads/<name>/.gitkeep
export const UPLOAD_FOLDERS = ["general", "pages", "gallery"];

// Allowed photo types: file extension -> mime type.
// SVG is NOT allowed because SVG files can contain JavaScript.
const ALLOWED_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Turns "My Photo (1).JPG" into "1730000000000-my-photo-1.jpg"
// so file names are always safe and never overwrite each other.
function makeSafeFileName(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${Date.now()}-${baseName || "photo"}${ext}`;
}

// Only accept real image types (extension AND mime type must match).
function photoFileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ALLOWED_TYPES[ext] && ALLOWED_TYPES[ext] === file.mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, GIF and WEBP images are allowed."));
  }
}

// Creates multer storage. "getFolder" decides which uploads/ subfolder to use.
function makeStorage(getFolder) {
  return multer.diskStorage({
    destination: async (req, file, cb) => {
      const folder = getFolder(req);

      if (!UPLOAD_FOLDERS.includes(folder)) {
        cb(new Error("Please choose a valid folder."));
        return;
      }

      const folderPath = path.join(UPLOADS_DIR, folder);
      await fs.mkdir(folderPath, { recursive: true });
      cb(null, folderPath);
    },
    filename: (req, file, cb) => {
      cb(null, makeSafeFileName(file.originalname));
    },
  });
}

// Upload form in the admin area.
// The folder <select> must come BEFORE the file input in the HTML form,
// otherwise req.body.folder is not available yet when the file arrives.
const photoUpload = multer({
  storage: makeStorage((req) => req.body.folder),
  fileFilter: photoFileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

// Images uploaded from inside CKEditor always go to uploads/pages/.
const editorUpload = multer({
  storage: makeStorage(() => "pages"),
  fileFilter: photoFileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

// "file" is the name of the file input in the admin upload form.
// "upload" is the field name CKEditor uses.
const uploadPhotoMiddleware = photoUpload.single("file");
const uploadEditorImageMiddleware = editorUpload.single("upload");

// Multer is written as middleware: (req, res, callback).
// These helpers wrap it in a Promise so we can use "await".
function runMiddleware(middleware, req, res) {
  return new Promise((resolve, reject) => {
    middleware(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function uploadPhoto(req, res) {
  return runMiddleware(uploadPhotoMiddleware, req, res);
}

export function uploadEditorImage(req, res) {
  return runMiddleware(uploadEditorImageMiddleware, req, res);
}

// Returns a list of photos for every folder:
// [{ folder: "pages", photos: ["pages/123-about.jpg", ...] }, ...]
export async function listPhotos() {
  const result = [];

  for (const folder of UPLOAD_FOLDERS) {
    let fileNames = [];
    try {
      fileNames = await fs.readdir(path.join(UPLOADS_DIR, folder));
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }

    const photos = fileNames
      .filter((name) => ALLOWED_TYPES[path.extname(name).toLowerCase()])
      .sort()
      .reverse() // newest first (names start with a timestamp)
      .map((name) => `${folder}/${name}`);

    result.push({ folder, photos });
  }

  return result;
}

// Checks a path like "pages/123-about.jpg":
// the folder must be allowed, the file name must be plain (no "../"),
// it must be an image and the file must really exist.
export async function isValidPhotoPath(photoPath) {
  if (typeof photoPath !== "string") {
    return false;
  }

  const parts = photoPath.split("/");
  if (parts.length !== 2) {
    return false;
  }

  const [folder, fileName] = parts;
  if (!UPLOAD_FOLDERS.includes(folder)) {
    return false;
  }
  if (fileName !== path.basename(fileName) || fileName.startsWith(".")) {
    return false;
  }
  if (!ALLOWED_TYPES[path.extname(fileName).toLowerCase()]) {
    return false;
  }

  try {
    await fs.access(path.join(UPLOADS_DIR, folder, fileName));
    return true;
  } catch {
    return false;
  }
}

// Deletes a photo. Returns true if it was deleted.
export async function deletePhoto(photoPath) {
  if (!(await isValidPhotoPath(photoPath))) {
    return false;
  }

  await fs.unlink(path.join(UPLOADS_DIR, photoPath));
  return true;
}
