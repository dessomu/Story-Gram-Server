const express = require("express");
const Story = require("../models/story");
const auth = require("../middleware/auth");
const router = express.Router();

// Save story
router.post("/", auth, async (req, res) => {
  const { userId, mediaURL, mediaType } = req.body;

  const newStory = await Story.create({ userId, mediaURL, mediaType });
  const populated = await newStory.populate("userId", "name profilePic");

  const io = req.app.get("io");
  io.emit("storyAdded", populated);

  res.status(201).json({ success: true, story: populated });
});

// Get paginated stories
router.get("/", auth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;

  const stories = await Story.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "name profilePic");

  const total = await Story.countDocuments();
  const hasMore = page * limit < total;

  res.json({ success: true, stories, hasMore });
});

// delete story
router.delete("/:id", auth, async (req, res) => {
  await Story.findOneAndDelete({ _id: req.params.id, userId: req.user });

  const io = req.app.get("io");
  io.emit("storyDeleted", req.params.id);

  res.status(200).json({ success: true });
});

module.exports = router;
