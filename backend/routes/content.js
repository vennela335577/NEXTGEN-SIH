const express = require("express");

const router = express.Router();

const contentData = require("../../data/content-data.json");

function normalizeTopic(topic) {
  return topic
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeLanguage(language) {
  return language
    .toLowerCase()
    .trim();
}

router.post("/", async (req, res) => {
  try {
    const { concept, language = "English" } = req.body;

    if (!concept) {
      return res.status(400).json({
        error: "Concept is required"
      });
    }

    const normalizedConcept = normalizeTopic(concept);
    const normalizedLanguage = normalizeLanguage(language);

    let languageKey;

    if (normalizedLanguage === "english") {
      languageKey = "English";
    } else if (normalizedLanguage === "telugu") {
      languageKey = "Telugu";
    } else if (normalizedLanguage === "hindi") {
      languageKey = "Hindi";
    } else {
      return res.status(400).json({
        error: "Supported languages are English, Telugu and Hindi"
      });
    }

    const matchedContent = contentData.find(
      (item) =>
        normalizeTopic(item.concept) === normalizedConcept
    );

    if (!matchedContent) {
      return res.json({
        concept: concept,
        found: false,
        message: "No suitable movie or video content found for this concept"
      });
    }

    const relatedContent = matchedContent.related_content.map((item) => {
      const sceneExplanation =
        item.scene_explanation?.[languageKey] ??
        item.scene_explanation?.English;

      const conceptConnection =
        item.concept_connection?.[languageKey] ??
        item.concept_connection?.English;

      return {
        ...item,
        scene_explanation: sceneExplanation,
        concept_connection: conceptConnection
      };
    });

    return res.json({
      concept: matchedContent.concept,
      found: true,
      related_content: relatedContent
    });

  } catch (error) {
    console.error("Content API Error:", error);

    return res.status(500).json({
      error: "Failed to process content"
    });
  }
});

module.exports = router;