const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

// setup multer + cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "stories",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });

// upload route
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const imageURL = req.file.path; // URL from Cloudinary
    res.json({ success: true, url: imageURL });
    console.log("image uploaded successfully", imageURL);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
