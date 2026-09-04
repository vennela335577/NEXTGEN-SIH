const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    topics: [
      "Photosynthesis",
      "Newton's Laws of Motion",
      "Ohm's Law",
      "Data Structures",
      "Artificial Intelligence"
    ]
  });
});

module.exports = router;
