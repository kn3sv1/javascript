import multer from "multer";
import path from "node:path";

const UPLOADS_DIR = path.join(import.meta.dirname, "..", "uploads");

function makeStorage(prefix) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      cb(null, `${prefix}/${file.originalname}`);
    },
  });
}

const catUpload = multer({ storage: makeStorage("cats") });
const doctorUpload = multer({ storage: makeStorage("doctors") });

// people photos: keep the file in memory first.
// index.js checks the chosen person, THEN writes the file to the folder.
const personUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5 MB
});

// file - is name in FORM HTML
export const uploadCatPhoto = catUpload.single("file");
export const uploadDoctorPhoto = doctorUpload.single("file");
export { UPLOADS_DIR };

// "photo" is the name of the file input in the form
export const uploadPersonPhoto = personUpload.single("photo");


