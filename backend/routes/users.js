const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Create a new user
router.post("/", async (req, res) => {
  try {
    const { name, email, language } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: "Name and email are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        error: "User already exists",
        user: existingUser
      });
    }

    const user = await User.create({
      name,
      email,
      language
    });

    res.status(201).json(user);

  } catch (error) {
    console.error("User creation error:", error);

    res.status(500).json({
      error: "Failed to create user"
    });
  }
});

module.exports = router;