const express = require("express");
const model = require("../services/gemini");

const router = express.Router();

// Retry Gemini request for temporary service errors
async function generateWithRetry(prompt, maxRetries = 2) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      lastError = error;

      const temporaryError =
        error?.status === 500 ||
        error?.status === 502 ||
        error?.status === 503 ||
        error?.status === 504;

      if (!temporaryError || attempt === maxRetries) {
        throw error;
      }

      console.log(
        `Gemini temporary error (${error.status}). Retrying...`
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw lastError;
}

// Follow-up question API
router.post("/", async (req, res) => {
  try {
    const { topic, question, language } = req.body;

    // Validate request
    if (!topic || !question) {
      return res.status(400).json({
        error: "Topic and question are required"
      });
    }

    const requestedLanguage = language || "English";

    // Language instructions
    let languageInstruction = "";

    if (
      requestedLanguage.toLowerCase() === "telugu" ||
      requestedLanguage.toLowerCase() === "roman telugu"
    ) {
      languageInstruction = `
Answer in Telugu language, but write everything using ONLY English
alphabet letters (Roman Telugu / Tenglish).

Do NOT use Telugu script.

Keep technical terms such as photosynthesis, glucose, oxygen,
voltage, current etc. in English when commonly used.
`;
    } else if (
      requestedLanguage.toLowerCase() === "hindi" ||
      requestedLanguage.toLowerCase() === "roman hindi"
    ) {
      languageInstruction = `
Answer in Hindi language, but write everything using ONLY English
alphabet letters (Roman Hindi).

Do NOT use Devanagari script.

Keep technical terms such as photosynthesis, glucose, oxygen,
voltage, current etc. in English when commonly used.
`;
    } else {
      languageInstruction = `
Answer in simple English.
`;
    }

    // Gemini prompt
    const prompt = `
You are a friendly educational AI assistant.

The student is learning this topic:

Topic: ${topic}

The student has asked this follow-up question:

Question: ${question}

${languageInstruction}

Answer the student's follow-up question clearly and directly.

Rules:
- Beginner-friendly language
- Keep the answer concise
- Explain the concept, not just give a one-word answer
- Give a simple example if useful
- Do not repeat the entire original topic unnecessarily
- Do not use markdown code blocks
`;

    let result;

    // Generate answer with retry
    try {
      result = await generateWithRetry(prompt, 2);
    } catch (error) {
      console.error("Gemini Follow-up Error:", error);

      // Handle temporary Gemini errors
      if (
        error?.status === 500 ||
        error?.status === 502 ||
        error?.status === 503 ||
        error?.status === 504
      ) {
        return res.status(200).json({
          topic,
          question,
          answer:
            "The AI service is temporarily busy. Please try again shortly.",
          language: requestedLanguage,
          fallback: true,
          reason: "Temporary Gemini service error"
        });
      }

      // Handle quota / rate limit
      if (error?.status === 429) {
        return res.status(200).json({
          topic,
          question,
          answer:
            requestedLanguage.toLowerCase() === "telugu" ||
            requestedLanguage.toLowerCase() === "roman telugu"
              ? "AI service quota temporarily exhausted. Konchem sepu tarvata malli try cheyyandi."
              : requestedLanguage.toLowerCase() === "hindi" ||
                requestedLanguage.toLowerCase() === "roman hindi"
              ? "AI service quota temporarily exhausted. Kripya thodi der baad dobara try karein."
              : "AI service quota is temporarily exhausted. Please try again shortly.",
          language: requestedLanguage,
          fallback: true,
          reason: "Gemini quota or rate limit exceeded"
        });
      }

      return res.status(500).json({
        error: "Failed to generate follow-up answer"
      });
    }

    const answer = result.response.text().trim();

    // Send response
    return res.json({
      topic,
      question,
      answer,
      language: requestedLanguage
    });

  } catch (error) {
    console.error("Follow-up Route Error:", error);

    return res.status(500).json({
      error: "Failed to process follow-up request"
    });
  }
});

module.exports = router;