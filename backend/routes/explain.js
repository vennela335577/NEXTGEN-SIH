const express = require("express");
const model = require("../services/gemini");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { topic, language } = req.body;

    if (!topic || !language) {
      return res.status(400).json({
        error: "Topic and language are required"
      });
    }

    const prompt = `
Explain the educational topic below in a simple way.

Topic: ${topic}
Language: ${language}

Return ONLY valid JSON.
Do not use markdown or code blocks.

Use exactly this format:
{
  "simple": "A simple explanation",
  "steps": [
    "Step 1",
    "Step 2",
    "Step 3"
  ],
  "analogy": "A simple real-life analogy"
}

Rules:
- Beginner-friendly language
- Maximum 5 steps
- Keep it clear and concise
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const explanation = JSON.parse(cleanText);

    res.json(explanation);

  } catch (error) {
    console.error("Gemini API Error:", error);

    res.status(500).json({
      error: "Failed to generate explanation"
    });
  }
});

module.exports = router;
