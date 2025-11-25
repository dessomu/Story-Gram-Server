const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  imageURL: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => Date.now() + 24 * 60 * 60 * 1000 }, // 24h
});

const Story = mongoose.model("Story", storySchema);
module.exports = Story;
