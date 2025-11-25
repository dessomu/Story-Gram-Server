const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String },
  profilePic: { type: String }, // stores image URL
});

const User = mongoose.model("User", userSchema);
module.exports = User;
