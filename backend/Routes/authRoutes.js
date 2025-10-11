require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid");
const User = require("../Model/User");
const {
  forgotPassword,
  verifyResetToken,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// ===== Nodemailer transporter =====
const transporter = nodemailer.createTransport(
  sgTransport({
    apiKey: process.env.SENDGRID_API_KEY
  })
);

// ===== Password Generator =====
function generatePassword(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

// ===== Register =====
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const user = new User({
      name,
      email: normalizedEmail,
      password,
      phone,
      plan: "free",
      friends: [],
      createdAt: new Date(),
    });

    await user.save();
    res.json({ message: "User registered successfully", user });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== Login with Login History Tracking =====
router.post("/login", async (req, res) => {
  try {
    const { email, password, browser, os, deviceType } = req.body;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    // 🔹 Add login history entry
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.push({
      ip,
      browser: browser || "Unknown",
      os: os || "Unknown",
      device: deviceType || "Unknown",
      time: new Date(),
    });

    // 🔹 Save user with new login history
    await user.save();

    res.json({
      message: "Login successful",
      user, // includes loginHistory now
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ===== Forgot Password =====
router.post("/forgot-password", forgotPassword);

// ===== Verify Reset Token =====
router.get("/reset-password/:token", verifyResetToken);

// ===== Reset Password =====
router.post("/reset-password/:token", resetPassword);

module.exports = router;
