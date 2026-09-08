const express = require("express");
const model = require("../services/gemini");

const router = express.Router();

const contentData = require("../../data/content-data.json");

router.post("/", async (req, res) => {
  try {
    const { concept, language = "English" } = req.body;

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

    // English: return original content
    if (language.toLowerCase() === "english") {
      return res.json({
        concept: matchedContent.concept,
        found: true,
        related_content: matchedContent.related_content
      });
    }

    let languageInstruction = "";

    if (language.toLowerCase() === "telugu") {
      languageInstruction = `
Translate the explanations into Telugu.

IMPORTANT:
- Use ONLY English alphabet letters.
- Use Roman Telugu / Tenglish only.
- DO NOT use Telugu script.
- Keep technical terms such as photosynthesis, sunlight,
  carbon dioxide, oxygen and glucose in English when natural.
- Keep the meaning accurate and beginner-friendly.
`;
    } else if (language.toLowerCase() === "hindi") {
      languageInstruction = `
Translate the explanations into Hindi.

IMPORTANT:
- Use ONLY English alphabet letters.
- Use Roman Hindi only.
- DO NOT use Devanagari script.
- Keep technical terms such as photosynthesis, sunlight,
  carbon dioxide, oxygen and glucose in English when natural.
- Keep the meaning accurate and beginner-friendly.
`;
    } else {
      return res.status(400).json({
        error: "Supported languages are English, Telugu and Hindi"
      });
    }

    const translatedContent = [];

    for (const item of matchedContent.related_content) {
      const prompt = `
Translate the following two educational explanations into ${language}.

${languageInstruction}

Scene explanation:
${item.scene_explanation}

Concept connection:
${item.concept_connection}

Return ONLY valid JSON.
Do not use markdown.
Do not use code blocks.

Use exactly this format:
{
  "scene_explanation": "...",
  "concept_connection": "..."
}

Rules:
- Translate only the two explanations.
- Do not add extra information.
- Preserve the original meaning.
- Keep it short and clear.
- For Telugu, use Roman Telugu only.
- For Hindi, use Roman Hindi only.
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const cleanText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const translated = JSON.parse(cleanText);

      translatedContent.push({
        ...item,
        scene_explanation: translated.scene_explanation,
        concept_connection: translated.concept_connection
      });
    }

    res.json({
      concept: matchedContent.concept,
      found: true,
      related_content: translatedContent
    });

  } catch (error) {
    console.error("Content API Error:", error);

    res.status(500).json({
      error: "Failed to process content"
    });
  }
});

module.exports = router;