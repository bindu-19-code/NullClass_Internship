const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  userEmail: { type: String, required: true }, // ⚡ use email instead of userId
  caption: { type: String, default: "" },
  media: { type: String, default: "" },
  likes: { type: [String], default: [] }, // store emails
  comments: [
    {
      user: String, // email
      text: String,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Post", PostSchema);
