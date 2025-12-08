const express = require("express");
const busboy = require("busboy");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

router.post("/", (req, res) => {
  const bb = busboy({ headers: req.headers });

  bb.on("file", (name, file, info) => {
    let uploaded = 0;
    let total = 0;

    file.on("data", (chunk) => {
      uploaded += chunk.length;
      const percentage = Math.round((uploaded / total) * 100);

      if (global.sendProgress) {
        global.sendProgress(percentage);
      }
    });

    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: "stories" },
      (err, result) => {
        if (err) return res.status(500).json({ success: false });
        return res.status(200).json({
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    file.pipe(uploadStream);
  });

  req.pipe(bb);
});

module.exports = router;
