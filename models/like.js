const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Story",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

likeSchema.index({ storyId: 1, userId: 1 }, { unique: true }); // avoid duplicates

const Like = mongoose.model("Like", likeSchema);
module.exports = Like;
