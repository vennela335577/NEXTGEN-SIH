const express = require("express");
const router = express.Router();

const contentData = require("../../data/content-data.json");

router.post("/", (req, res) => {
  const { concept } = req.body;

  if (!concept) {
    return res.status(400).json({
      error: "Concept is required"
    });
  }

  const matchedContent = contentData.find(
    (item) => item.concept.toLowerCase() === concept.toLowerCase()
  );

  if (!matchedContent) {
    return res.json({
      concept: concept,
      found: false,
      message: "No suitable movie or video content found for this concept"
    });
  }

  res.json({
    concept: matchedContent.concept,
    found: true,
    related_content: matchedContent.related_content
  });
});

module.exports = router;