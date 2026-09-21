const multer = require("multer");
const path = require("path");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

function makeStorage(prefix) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      //const ext = path.extname(file.originalname);
      //const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      //const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      //cb(null, `${prefix}-${unique}${ext}`);
      cb(null, `${prefix}/${file.originalname}`);
    },
  });
}

const catUpload = multer({ storage: makeStorage("cats") });
const doctorUpload = multer({ storage: makeStorage("doctors") });

module.exports = {
  // file - is name in FORM HTML
  uploadCatPhoto: catUpload.single("file"),
  uploadDoctorPhoto: doctorUpload.single("file"),
  UPLOADS_DIR,
};
