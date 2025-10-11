const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Application = require("../Model/Application");
const User = require("../Model/User");
const Internship = require("../Model/Internship");
const Resume = require("../Model/Resume"); // new

// Plan limits
const PLAN_LIMITS = {
  free: 1,
  bronze: 3,
  silver: 5,
  gold: Infinity,
};

// ✅ Get all applications of a user (by Mongo _id)
router.get("/user/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Find user by MongoDB _id
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // 2️⃣ Find all applications of this user
    const applications = await Application.find({ user: user._id })
      .populate("internship")
      .populate("user")
      .populate("resume"); // populate resume if exists

    res.status(200).json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Apply for internship
router.post("/", async (req, res) => {
  const { userId, internshipId, coverLetter } = req.body;

  if (!userId) return res.status(400).json({ error: "User ID is required" });
  if (!mongoose.Types.ObjectId.isValid(internshipId))
    return res.status(400).json({ error: "Invalid internship ID" });

  try {
    // 1️⃣ Find user by MongoDB _id
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // 2️⃣ Find internship
    const internship = await Internship.findById(internshipId);
    if (!internship) return res.status(404).json({ error: "Internship not found" });

    // 3️⃣ Check plan limits
    const appliedCount = await Application.countDocuments({ user: user._id });
    const limit = PLAN_LIMITS[user.plan || "free"];
    if (appliedCount >= limit) {
      return res.status(403).json({
        error: `Your plan (${user.plan || "free"}) allows only ${limit} applications.`,
      });
    }

    // 4️⃣ Get latest paid resume
    const latestResume = await Resume.findOne({ student: user._id, paid: true })
      .sort({ createdAt: -1 });

    // 5️⃣ Create application
    const newApp = new Application({
      user: user._id,
      internship: internship._id,
      company: internship.company,
      category: internship.category,
      coverLetter: coverLetter || "",
      resume: latestResume ? latestResume._id : null, // attach resume if exists
      createdAt: new Date(),
      status: "pending",
    });

    const saved = await newApp.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;