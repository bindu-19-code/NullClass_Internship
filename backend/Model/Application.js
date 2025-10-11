const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  coverLetter: {
    type: String,
    default: "",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Internship",
    required: true,
  },
  status: {
    type: String,
    enum: ["accepted", "pending", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", default: null },
});

module.exports = mongoose.models.Application || mongoose.model("Application", applicationSchema);
