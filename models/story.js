const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  mediaURL: { type: String }, // instead of imageURL
  mediaType: { type: String, enum: ["image", "video"] },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => Date.now() + 24 * 60 * 60 * 1000 }, // 24h
});

const Story = mongoose.model("Story", storySchema);
module.exports = Story;
