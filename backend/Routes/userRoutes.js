const express = require("express");
const router = express.Router();
const User = require("../Model/User");

// Get user by MongoDB _id
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // Use MongoDB _id
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
