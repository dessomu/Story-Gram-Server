const express = require("express");
const Story = require("../models/Story");

const router = express.Router();

// Save story after uploading image
router.post("/", async (req, res) => {
  try {
    const { userId, imageURL } = req.body;
    const newStory = await Story.create({ userId, imageURL });
    res.json({ success: true, story: newStory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all stories
router.get("/", async (req, res) => {
  try {
    const stories = await Story.find().populate("userId");
    console.log(stories);

    res.json(stories);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
