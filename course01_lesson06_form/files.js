const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.params.folder;
    const uploadPath = path.join(__dirname, "./public/uploads", folder);
    //to debugif correct PATH
    console.log(uploadPath);

    // create folder if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Upload one file
router.post("/upload/:folder", upload.single("file"), (req, res) => {
  res.json({
    message: "File uploaded",
    file: req.file.filename,
  });
});

// Get all files from folder
router.get("/upload/:folder", (req, res) => {
  const folder = req.params.folder;

  const folderPath = path.join(__dirname, "./public/uploads", folder);

  if (!fs.existsSync(folderPath)) {
    return res.status(404).json({
      message: "Folder not found",
    });
  }

  const files = fs.readdirSync(folderPath);

  res.json({
    folder,
    files,
  });
});

module.exports = router;
