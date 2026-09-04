const express = require("express");
const model = require("../services/gemini");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: "Text is required"
      });
    }

    const prompt = `
Detect the language of the following text.

Text: ${text}

Return ONLY valid JSON.
Do not use markdown or code blocks.

Use exactly this format:
{
  "language": "English"
}

Return only the language name.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const cleanText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const detectedLanguage = JSON.parse(cleanText);

    res.json(detectedLanguage);

  } catch (error) {
    console.error("Language Detection Error:", error);

    res.status(500).json({
      error: "Failed to detect language"
    });
  }
});

module.exports = router;