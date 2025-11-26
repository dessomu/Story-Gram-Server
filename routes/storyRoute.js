const express = require("express");
const Story = require("../models/Story");
const auth = require("../middleware/auth");

const router = express.Router();

// Save story after uploading image
router.post("/", auth, async (req, res) => {
  try {
    const { userId, imageURL } = req.body;
    await Story.create({ userId, imageURL });

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
      .populate("userId");

    const total = await Story.countDocuments();
    const hasMore = page * limit < total;

    return res.status(200).json({ stories, hasMore });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

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

module.exports = router;
