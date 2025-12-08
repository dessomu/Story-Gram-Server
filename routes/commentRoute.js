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
  try {
    const comments = await Comment.find({ storyId: req.params.id })
      .sort({ createdAt: -1 })
      .populate("userId", "name profilePic");

    return res.json({ success: true, comments });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ success: false, message: "failed to get comments" });
  }
});

router.delete("/:storyId/comment/:commentId", auth, async (req, res) => {
  try {
    const { storyId, commentId } = req.params;
    const userId = req.user;

    const deleted = await Comment.findOneAndDelete({ _id: commentId, userId });

    if (!deleted) return res.status(404).json({ message: "Not found" });

    await Story.findByIdAndUpdate(storyId, { $inc: { commentCount: -1 } });

    req.app.get("io").emit("commentDeleted", { storyId, commentId });

    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Failed to delete comment" });
  }
});

module.exports = router;
