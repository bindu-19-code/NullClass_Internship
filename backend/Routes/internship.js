const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Internship = require('../Model/Internship'); // make sure path is correct

// Get all internships (optional)
router.get('/', async (req, res) => {
  try {
    const internships = await Internship.find();
    res.json(internships);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get internship by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid internship ID" });
    }

    const internship = await Internship.findById(id);
    if (!internship) return res.status(404).json({ message: "Internship not found" });

    res.json(internship);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
