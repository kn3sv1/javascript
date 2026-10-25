import multer from "multer";
import path from "node:path";
import { UPLOAD_DIR } from "./config.js";

function makeStorage(prefix) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      cb(null, `${prefix}/${file.originalname}`);
    },
  });
}

// directory where we store file and we return back path with this directory 
const coffeeUpload = multer({ storage: makeStorage("coffee") });

export const uploadCoffee = coffeeUpload.single("file");
export const COFFEE_UPLOAD_DIR = path.join(UPLOAD_DIR, "coffee");
