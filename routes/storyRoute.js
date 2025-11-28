const express = require("express");
const Story = require("../models/Story");
const auth = require("../middleware/auth");

const router = express.Router();

// Save story after uploading image
router.post("/", auth, async (req, res) => {
  try {
    const { userId, mediaURL, mediaType } = req.body;

    if (!mediaURL || !mediaType) {
      return res.status(400).json({ error: "mediaURL and mediaType required" });
    }
    const newStory = await Story.create({ userId, mediaURL, mediaType });

    const io = req.app.get("io");
    io.emit("storyAdded", newStory); // notify clients in realtime

    const stories = await Story.find().populate("userId");

    return res.status(201).json({ success: true, stories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all stories
router.get("/", auth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;

  try {
    const stories = await Story.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId")
      .populate("comments.userId", "name profilePic");

    const total = await Story.countDocuments();
    const hasMore = page * limit < total;

    return res.status(200).json({ stories, hasMore });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// delete story
router.delete("/:id", auth, async (req, res) => {
  try {
    await Story.findOneAndDelete({
      _id: req.params.id,
      userId: req.user, // prevents others from deleting
    });

    const io = req.app.get("io");
    io.emit("storyDeleted", req.params.id); // realtime deletion notify

    return res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// add like
router.patch("/:id/like", auth, async (req, res) => {
  try {
    const userId = req.user;
    const storyId = req.params.id;

    // toggle like atomically
    const story = await Story.findById(storyId);

    if (!story) return res.status(404).json({ message: "Story not found" });

    const isLiked = story.likes.includes(userId);

    const updatedStory = await Story.findByIdAndUpdate(
      storyId,
      isLiked
        ? { $pull: { likes: userId } } // UNLIKE
        : { $addToSet: { likes: userId } }, // LIKE
      { new: true } // return updated document
    );

    // SOCKET EMIT for real-time update
    const io = req.app.get("io");
    io.emit("likeUpdated", { storyId, likes: updatedStory.likes });
    res.json({ success: true, likes: updatedStory.likes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// add comment
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user;
    const storyId = req.params.id;

    const updatedStory = await Story.findByIdAndUpdate(
      storyId,
      {
        $push: {
          comments: {
            userId,
            text,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    ).populate("comments.userId", "name profilePic");

    if (!updatedStory)
      return res.status(404).json({ message: "Story not found" });

    // Socket.io broadcast
    const io = req.app.get("io");
    io.emit("commentAdded", {
      storyId,
      comments: updatedStory.comments,
    });

    res.json({ success: true, comments: updatedStory.comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// delete comment
router.delete("/:storyId/comment/:commentId", auth, async (req, res) => {
  try {
    const { storyId, commentId } = req.params;
    const userId = req.user;

    // Pull comment only if user owns it
    const updatedStory = await Story.findOneAndUpdate(
      { _id: storyId },
      {
        $pull: {
          comments: { _id: commentId, userId }, // user must match
        },
      },
      { new: true }
    ).populate("comments.userId", "name profilePic");

    if (!updatedStory) {
      return res.status(404).json({ message: "Story or comment not found" });
    }

    // Emit socket update
    const io = req.app.get("io");
    io.emit("commentDeleted", { storyId, comments: updatedStory.comments });

    return res.json({ success: true, comments: updatedStory.comments });
  } catch (err) {
    console.error("delete comment error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
