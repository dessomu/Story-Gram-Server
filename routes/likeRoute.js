const express = require("express");
const Like = require("../models/like");
const Story = require("../models/story");
const auth = require("../middleware/auth");
const router = express.Router();

router.patch("/:id/like", auth, async (req, res) => {
  const storyId = req.params.id;
  const userId = req.user;

  const existing = await Like.findOne({ storyId, userId });

  if (existing) {
    await Like.findByIdAndDelete(existing._id);
    await Story.findByIdAndUpdate(storyId, { $inc: { likeCount: -1 } });
  } else {
    await Like.create({ storyId, userId });
    await Story.findByIdAndUpdate(storyId, { $inc: { likeCount: 1 } });
  }

  const likeCount = await Like.countDocuments({ storyId });
  console.log(likeCount);

  req.app.get("io").emit("likeUpdated", { storyId, likeCount });

  res.json({ success: true, likeCount });
});

module.exports = router;
