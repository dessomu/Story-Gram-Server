const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  global.sendProgress = (percent) => {
    res.write(`event: progress\n`);
    res.write(`data: ${percent}\n\n`);
  };
});

module.exports = router;
