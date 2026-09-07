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

    let languageInstruction = "";

    if (language.toLowerCase() === "telugu") {
      languageInstruction = `
IMPORTANT:
Explain everything in Telugu language, but write Telugu using ONLY English
alphabet letters (Roman Telugu / Tenglish).

Do NOT use Telugu script.
Do NOT use Devanagari script.
Example style:
"Photosynthesis ante plants sunlight ni use cheskoni food prepare
cheskune process."

Keep technical terms such as photosynthesis, glucose, oxygen,
voltage, current etc. in English when they are commonly used.
`;
    } else if (language.toLowerCase() === "hindi") {
      languageInstruction = `
Explain everything in Hindi language, but write Hindi using ONLY English
alphabet letters (Roman Hindi).

Do NOT use Devanagari script.
`;
    } else {
      languageInstruction = `
Explain everything in simple English.
`;
    }

    const prompt = `
Explain the educational topic below in a simple way.

Topic: ${topic}
Requested Language: ${language}

${languageInstruction}

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
- Follow the requested language format exactly
- For Telugu, use ONLY English alphabet letters
- For Hindi, use ONLY English alphabet letters
- Do not write Telugu or Hindi script when Roman language is requested
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