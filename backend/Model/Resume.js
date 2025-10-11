const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    qualification: { type: String, required: true },
    experience: { type: String },
    personalDetails: { type: String },
    photo: { type: String }, // store base64 or cloud URL
    createdAt: { type: Date, default: Date.now },
    paid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
