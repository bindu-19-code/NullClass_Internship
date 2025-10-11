const express = require("express");
const Stripe = require("stripe");
const nodemailer = require("nodemailer");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Temporary OTP store
const otpStore = {};

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bindukreddy1111@gmail.com",
    pass: "sqhq eabf uquo wnec",
  },
});

// ===== Send OTP =====
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // 5 min

  try {
    await transporter.sendMail({
      from: `"Support" <bindukreddy1111@gmail.com>`,
      to: email,
      subject: "Your Resume OTP",
      text: `Your OTP for resume verification is: ${otp}. It is valid for 5 minutes.`,
    });

    console.log(`OTP for ${email} sent successfully`);
    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Error sending OTP email:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// ===== Verify OTP =====
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record) return res.status(400).json({ message: "No OTP found" });
  if (Date.now() > record.expires) return res.status(400).json({ message: "OTP expired" });
  if (record.otp != otp) return res.status(400).json({ message: "Invalid OTP" });

  delete otpStore[email];
  res.json({ message: "OTP verified" });
});

// ===== Create Payment Intent =====
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount = 50 * 100 } = req.body; // Rs 50 in paise
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "inr",
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment creation failed" });
  }
});

// ===== Save Resume after Payment =====
router.post("/save-resume", upload.single("photo"), async (req, res) => {
  try {
    const Resume = require("../Model/Resume");

    console.log("REQ BODY:", req.body);
    console.log("REQ FILE:", req.file);

    const { studentId, name, qualification, experience, email, phone } = req.body;

    if (!studentId || !name || !qualification) {
    return res.status(400).json({ message: "Missing required fields" });
    }

    const resume = new Resume({
      student: studentId,
      name,
      qualification,
      experience,
      email,
      phone,
      photo: req.file ? req.file.path : null,
 // saved file path
      paid: true,
    });

    await resume.save();
    res.json({ message: "Resume saved successfully", resume });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save resume" });
  }
});
