const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  mediaURL: { type: String }, // instead of imageURL
  mediaType: { type: String, enum: ["image", "video"] },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => Date.now() + 24 * 60 * 60 * 1000 }, // 24h
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
});

const Story = mongoose.models.Story || mongoose.model("Story", storySchema);
module.exports = Story;
