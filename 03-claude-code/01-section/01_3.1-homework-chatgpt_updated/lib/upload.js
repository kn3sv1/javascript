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

// file - is name in FORM HTML
export const uploadCatPhoto = catUpload.single("file");
export const uploadDoctorPhoto = doctorUpload.single("file");
export { UPLOADS_DIR };
