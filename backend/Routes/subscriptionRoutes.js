const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const User = require("../Model/User");

const stripe = new Stripe("YOUR_STRIPE_SECRET_KEY"); // replace with your actual Stripe secret key

// 📌 Create subscription (Stripe Checkout)
router.post("/", async (req, res) => {
  const { userId, plan } = req.body;

  try {
    // 1️⃣ Check IST time restriction (only 9–10 AM)
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const istDate = new Date(utc + 3600000 * 5.5);
    const hours = istDate.getHours();

    if (hours < 10 || hours >= 11) {
      return res.status(403).json({ message: "Payments allowed only between 10-11 AM IST" });
    }

    // 2️⃣ Verify user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 3️⃣ Plan prices (mock in paise for Stripe, INR cents)
    const planPrices = {
      bronze: 10000, // ₹100 (Stripe uses paise)
      silver: 30000, // ₹300
      gold: 100000,  // ₹1000
    };

    if (!planPrices[plan]) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    // 4️⃣ Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: `${plan.toUpperCase()} Plan Subscription` },
            unit_amount: planPrices[plan],
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `https://nullclass-internship-1gk4.onrender.com/api/subscription/success?userId=${userId}&plan=${plan}`,
      cancel_url: "http://localhost:3000/subscription/cancel", // frontend cancel page
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 📌 Success route (after payment)
router.get("/success", async (req, res) => {
  const { userId, plan } = req.query;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Activate subscription
    user.plan = plan;
    user.subscriptionDate = new Date();
    await user.save();

    // TODO: send email with nodemailer (invoice/plan details)
    res.send("✅ Subscription successful! You can now apply based on your plan.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
