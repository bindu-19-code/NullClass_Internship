const mongoose = require("mongoose");

const InternshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    default: "",
  },
  aboutCompany: {
    type: String,
    default: "",
  },
  aboutInternship: {
    type: String,
    default: "",
  },
  whoCanApply: {
    type: String,
    default: "",
  },
  perks: {
    type: [String],
    default: [],
  },
  numberOfOpening: {
    type: Number,
    default: 1,
  },
  stipend: {
    type: String,
    default: "Not specified",
  },
  startDate: {
    type: Date,
  },
  additionalInfo: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Internship", InternshipSchema);
