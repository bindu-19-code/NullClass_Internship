const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 🔹 Sub-schema for login history
const loginHistorySchema = new mongoose.Schema({
  ip: { type: String, required: true },
  browser: { type: String, required: true },
  os: { type: String, required: true },
  device: { type: String, required: true },
  time: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed password
    resetToken: { type: String }, // for password reset
    resetTokenExpire: { type: Date }, // token expiry time (matches controller)
    phone: { type: String },

    // Friends system
    friends: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },

    lastPasswordReset: { type: Date, default: null }, // tracks daily limit

    // 🔹 Subscription fields
    plan: { 
      type: String, 
      enum: ["free", "bronze", "silver", "gold"], 
      default: "free" 
    },
    subscriptionDate: { type: Date, default: null },
    subscriptionExpiry: { type: Date, default: null },

    // 🔹 Login history
    loginHistory: { type: [loginHistorySchema], default: [] },
  },
  { timestamps: true }
);

// 🔹 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔹 Method to compare password (for login)
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
