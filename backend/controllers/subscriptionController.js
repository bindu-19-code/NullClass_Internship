const Razorpay = require("razorpay");
const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid");


// 🟢 Setup Razorpay
const razorpay = new Razorpay({
  key_id: "YOUR_RAZORPAY_KEY_ID",
  key_secret: "YOUR_RAZORPAY_SECRET",
});

// 🟢 Time Restriction Helper
function isWithinTimeWindow() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 5.5 * 3600000);
  const hour = ist.getHours();
  return hour >= 10 && hour < 11; // Only allow between 10–11 AM IST
}

// Controllers/subscriptionController.js
exports.subscribe = (req, res) => {
  const { email } = req.body;
  // handle subscription logic here
  res.json({ success: true, message: "Subscribed successfully!" });
};

