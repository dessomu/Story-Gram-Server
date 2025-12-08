const express = require("express");
const Story = require("../models/story");
const auth = require("../middleware/auth");
const cloudinary = require("../config/cloudinary");
const router = express.Router();

// Save story
router.post("/", auth, async (req, res) => {
  try {
    const { userId, mediaURL, mediaType, mediaPublicId } = req.body;

    const newStory = await Story.create({
      userId,
      mediaURL,
      mediaType,
      mediaPublicId,
    });

    const populated = await newStory.populate("userId", "name profilePic");

    const io = req.app.get("io");
    io.emit("storyAdded", populated);

    return res.status(201).json({ success: true, story: populated });
  } catch (error) {
    console.error("Create story error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create story",
      error: error.message,
    });
  }
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
  try {
    const story = await Story.findOneAndDelete({
      _id: req.params.id,
      userId: req.user, // IMPORTANT FIX
    });

    if (!story) return res.status(404).json({ message: "Not found" });

    const result = await cloudinary.uploader.destroy(story.mediaPublicId, {
      resource_type: story.mediaType,
    });

    const io = req.app.get("io");
    io.emit("storyDeleted", req.params.id);

    console.log("deleted story");

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete story error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
