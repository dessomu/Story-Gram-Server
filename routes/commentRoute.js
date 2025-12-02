const express = require("express");
const Comment = require("../models/comment");
const Story = require("../models/story");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/:id/comment", auth, async (req, res) => {
  const { text } = req.body;
  const storyId = req.params.id;
  const userId = req.user;

  const newComment = await Comment.create({ storyId, userId, text });
  await Story.findByIdAndUpdate(storyId, { $inc: { commentCount: 1 } });

  const populated = await newComment.populate("userId", "name profilePic");

  req.app.get("io").emit("commentAdded", { storyId, comment: populated });

  res.json({ success: true, comment: populated });
});

router.get("/:id/comments", auth, async (req, res) => {
  const comments = await Comment.find({ storyId: req.params.id })
    .sort({ createdAt: -1 })
    .populate("userId", "name profilePic");

  res.json({ success: true, comments });
});

router.delete("/:storyId/comment/:commentId", auth, async (req, res) => {
  const { storyId, commentId } = req.params;
  const userId = req.user;

  const deleted = await Comment.findOneAndDelete({ _id: commentId, userId });

  if (!deleted) return res.status(404).json({ message: "Not found" });

  await Story.findByIdAndUpdate(storyId, { $inc: { commentCount: -1 } });

  req.app.get("io").emit("commentDeleted", { storyId, commentId });

  res.json({ success: true });
});

module.exports = router;
