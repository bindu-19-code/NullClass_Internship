require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const Internship = require("./Model/Internship"); // Adjust path if your model is in a different folder
const Application = require("./Model/Application"); // Adjust path if your model is in a different folder

app.use(
  cors({
    origin: "https://nullclass-internship.netlify.app",
    methods: ["GET","POST","PUT","DELETE","OPTIONS"],
    credentials: true,
  })
);

// Simple random password generator
function generateRandomPassword(length = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// OTP store (in-memory)
const otpStore = {};

const transporter = nodemailer.createTransport(
  sgTransport({
    apiKey: process.env.SENDGRID_API_KEY
  })
);

// Models
const User = require("./Model/User");
const Resume = require("./Model/Resume");

// Routes
const postRoutes = require("./Routes/postRoutes");
const internshipRoutes = require("./Routes/internship");
const subscriptionRoutes = require("./Routes/subscriptionRoutes");
const applicationRoutes = require("./Routes/application");
const authRoutes = require("./Routes/authRoutes"); // CommonJS

const port = process.env.PORT || 5000;

// ===== Middleware =====
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ===== JWT =====
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const generateJWT = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });

// ===== Plans =====
const plans = {
  free: { price: 0, maxApplications: 1 },
  bronze: { price: 100, maxApplications: 3 },
  silver: { price: 300, maxApplications: 5 },
  gold: { price: 1000, maxApplications: Infinity },
};

// ===== Payment Window =====
const isPaymentAllowed = (startHour = 10, endHour = 11) => {
  const now = new Date();
  const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(utcMillis + istOffset);
  const hour = istTime.getHours();
  console.log(`Current IST time: ${istTime.toISOString()} | Hour: ${hour}`);
  return hour >= startHour && hour < endHour;
};

// ===== Resume Routes =====

// 1️⃣ Send OTP
app.post("/api/resume/send-otp", async (req, res) => {  // <-- make route async
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    console.log("📩 Sending OTP to:", email);
    console.log("EMAIL_USER:", process.env.EMAIL);
    console.log("APP_PASSWORD exists:", !!process.env.EMAIL_PASS);

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // 5 min
    console.log(`OTP for ${email}: ${otp}`);
    // Send OTP via email
    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL}>`,
      to: email,
      subject: "Your Resume OTP",
      text: `Your OTP is ${otp}. Valid for 5 minutes.`,
    });
 // optional, for dev only
    res.json({ message: "OTP sent successfully to email" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// backend / Express
// POST /api/resume/create-payment-intent
app.post("/api/resume/create-payment-intent", async (req, res) => {
  try {
    const { amount = 50 * 100 } = req.body; // Rs 50 in paise
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "inr",
      description: "Resume Generation Payment",
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Resume payment creation error:", err);
    res.status(500).json({ message: "Failed to create resume payment intent" });
  }
});

app.post("/api/auth/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, autoGenerate } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    let passwordToSet;

    if (autoGenerate) {
      passwordToSet = generateRandomPassword();
    } else if (newPassword) {
      passwordToSet = newPassword;
    } else {
      return res.status(400).json({ message: "Password is required" });
    }

    // Hash before saving
    user.password = passwordToSet;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.json({
      message: "Password reset successfully",
      password: autoGenerate ? passwordToSet : undefined,
    });
  } catch (err) {
    console.error("ResetPassword error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 2️⃣ Verify OTP
app.post("/api/resume/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  if (!record) return res.status(400).json({ message: "No OTP found" });
  if (Date.now() > record.expires) return res.status(400).json({ message: "OTP expired" });
  if (record.otp != otp) return res.status(400).json({ message: "Invalid OTP" });

  delete otpStore[email];
  res.json({ message: "OTP verified" });
});


// 4️⃣ Save Resume after payment
app.post("/api/resume/save-resume", upload.single("photo"), async (req, res) => {
  try {
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
      photo: req.file ? req.file.path : null, // save uploaded file path
      paid: true,
    });

    await resume.save();
    res.json({ message: "Resume saved successfully", resume });
  } catch (err) {
    console.error("Resume save error:", err);
    res.status(500).json({ message: "Failed to save resume", error: err.message });
  }
});


// ===== Subscription / Stripe Routes =====
app.post("/api/subscribe", async (req, res) => {
  try {
    const { userId, plan } = req.body;
    if (!plans[plan]) return res.status(400).json({ message: "Invalid plan" });
    if (!isPaymentAllowed())
      return res.status(403).json({ message: "Payments allowed only 10–11 AM IST" });

    const planData = plans[plan];
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "INR",
            product_data: { name: `${plan} plan` },
            unit_amount: planData.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:3000/payment-success?plan=${plan}&userId=${userId}&sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/payment-cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment creation failed", error: err.message });
  }
});

// Stripe session info
app.get("/api/stripe-session/:sessionId", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.json({
      amount_total: session.amount_total,
      currency: session.currency,
      payment_intent: session.payment_intent,
    });
  } catch (err) {
    console.error("Stripe session fetch error:", err);
    res.status(500).json({ message: "Failed to retrieve session", error: err.message });
  }
});

// Payment success (Stripe)
app.post("/api/payment-success", async (req, res) => {
  const { userId, plan } = req.body;
  try {
    if (!userId || !plan) return res.status(400).json({ message: "userId and plan required" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.plan = plan;
    user.subscriptionDate = new Date();
    await user.save();

    res.json({ message: "Subscription activated!" });
  } catch (err) {
    console.error("Payment success error:", err);
    res.status(500).json({ message: "Failed to update subscription", error: err.message });
  }
});

// ===== Auth =====
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateJWT(user._id);
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/internships", async (req, res) => {
  const internships = await Internship.find(); // check this collection
  res.json(internships);
});

app.get("/api/application/user/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const applications = await Application.find({ user: userId });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Backend is live!");
});

app.get("/api/auth/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    res.json({ message: "Token valid" });
  } catch (err) {
    console.error("VerifyToken error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== Routes =====
app.use("/api/applications", applicationRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", subscriptionRoutes);
app.use("/api/auth", authRoutes);

app.options("*", cors()); // enable preflight for all routes


// ===== MongoDB =====

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// ===== Start Server =====
app.listen(port, () => console.log(`Server running on ${port}`));
