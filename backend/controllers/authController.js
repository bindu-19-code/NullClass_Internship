const User = require("../Model/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

// In-memory store to limit daily reset requests (optional)
const resetRequestMap = new Map();

// Random password generator (letters + numbers)
function generatePassword(length = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// Setup Nodemailer transporter (once at top)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bindukreddy1111@gmail.com",  // your email
    pass: "sqhq eabf uquo wnec",        // app password
  },
});

// ====== FORGOT PASSWORD ======
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Limit to 1 reset per day (optional, dev may disable)
    const today = new Date().toISOString().slice(0, 10);
    if (user.lastPasswordReset?.toISOString().slice(0, 10) === today) {
      return res.status(429).json({ message: "You can request reset only once per day" });
    }

    // Generate reset token and expiry
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    user.lastPasswordReset = new Date();
    await user.save();

    // Link to frontend reset page
    const resetLink = `http://localhost:3000/reset-password/${token}`;

    // Send email
    await transporter.sendMail({
      from: `"Support" <bindukreddy1111@gmail.com>`,
      to: user.email,
      subject: "Password Reset",
      html: `<p>Click the link below to reset your password. This link is valid for 15 minutes:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    });

    res.json({ message: "Reset link sent to your email!" });
  } catch (err) {
    console.error("ForgotPassword error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====== VERIFY RESET TOKEN ======
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    res.json({ valid: true });
  } catch (err) {
    console.error("VerifyToken error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====== RESET PASSWORD ======
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, autoGenerate } = req.body; // match frontend

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Generate password if requested
    const newPass = autoGenerate ? generatePassword() : password;
    user.password = await bcrypt.hash(newPass, 10); // hash password
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({
      message: "Password reset successful",
      password: autoGenerate ? newPass : undefined, // return only if auto-generated
    });
  } catch (err) {
    console.error("ResetPassword error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  forgotPassword,
  verifyResetToken,
  resetPassword,
};
