const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("media"), async (req, res) => {
  try {
    // convert buffer → base64 → data URI
    const b64 = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: "stories",
      resource_type: "auto", // handles both images & videos
    });

    console.log("✅ Upload success:", uploadResult.secure_url);
    res.status(200).json({ success: true, url: uploadResult.secure_url });
  } catch (error) {
    console.error("❌ Upload failed:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
