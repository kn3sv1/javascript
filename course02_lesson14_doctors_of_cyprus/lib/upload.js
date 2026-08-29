const multer = require('multer');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

function makeStorage(prefix) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${prefix}-${unique}${ext}`);
    }
  });
}

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image files are allowed'));
};

const cityUpload = multer({ storage: makeStorage('city'), fileFilter: imageFilter });
const doctorUpload = multer({ storage: makeStorage('doctor'), fileFilter: imageFilter });

module.exports = {
  uploadCityPhoto: cityUpload.single('photo'),
  uploadDoctorPhoto: doctorUpload.single('photo'),
  UPLOADS_DIR
};
