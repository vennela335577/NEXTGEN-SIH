const express = require("express");
const model = require("../services/gemini");
const ExplanationCache = require("../models/ExplanationCache");
const {
  normalizeTopic,
  normalizeLanguage
} = require("../utils/normalize");

const explanationData = require("../../data/explanation-data.json");

const router = express.Router();

async function generateWithRetry(prompt, maxRetries = 2) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      lastError = error;

      if (error?.status === 429) {
        throw error;
      }

      const temporaryError =
        error?.status === 500 ||
        error?.status === 502 ||
        error?.status === 503 ||
        error?.status === 504;

      if (!temporaryError || attempt === maxRetries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw lastError;
}

router.post("/", async (req, res) => {
  try {
    const { topic, language } = req.body;

    if (!topic || !language) {
      return res.status(400).json({
        error: "Topic and language are required"
      });
    }

    const normalizedTopic = normalizeTopic(topic);
    const normalizedLanguage = normalizeLanguage(language);

    // Convert language name to JSON key
    let languageKey;

    if (
      normalizedLanguage === "english"
    ) {
      languageKey = "English";
    } else if (
      normalizedLanguage === "telugu" ||
      normalizedLanguage === "roman telugu"
    ) {
      languageKey = "Telugu";
    } else if (
      normalizedLanguage === "hindi" ||
      normalizedLanguage === "roman hindi"
    ) {
      languageKey = "Hindi";
    } else {
      languageKey = "English";
    }

    // =====================================================
    // 1. CHECK PRE-STORED EXPLANATION DATA FIRST
    // =====================================================

    const storedExplanation =
      explanationData[normalizedTopic]?.[languageKey];

    if (storedExplanation) {
      console.log(
        `Stored Explanation HIT: ${normalizedTopic} - ${languageKey}`
      );

      // Also save it into MongoDB cache
      // so future requests can use the cache.
      try {
        await ExplanationCache.findOneAndUpdate(
          {
            topic: normalizedTopic,
            language: normalizedLanguage
          },
          {
            topic: normalizedTopic,
            language: normalizedLanguage,
            response: storedExplanation
          },
          {
            upsert: true,
            new: true
          }
        );

        console.log(
          `Cache SEEDED: ${normalizedTopic} - ${normalizedLanguage}`
        );
      } catch (cacheError) {
        console.error(
          "Cache Seed Error:",
          cacheError.message
        );
      }

      return res.json(storedExplanation);
    }

    // =====================================================
    // 2. CHECK MONGODB CACHE
    // =====================================================

    const cachedExplanation =
      await ExplanationCache.findOne({
        topic: normalizedTopic,
        language: normalizedLanguage
      });

    if (cachedExplanation) {
      console.log(
        `Cache HIT: ${normalizedTopic} - ${normalizedLanguage}`
      );

      return res.json(cachedExplanation.response);
    }

    console.log(
      `Cache MISS: ${normalizedTopic} - ${normalizedLanguage}`
    );

    // =====================================================
    // 3. USE GEMINI ONLY IF NOT STORED/CACHED
    // =====================================================

    let languageInstruction = "";

    if (languageKey === "Telugu") {
      languageInstruction = `
Explain everything in Telugu language, but write Telugu
using ONLY English alphabet letters (Roman Telugu / Tenglish).

Do NOT use Telugu script.
Keep technical terms such as photosynthesis, glucose,
oxygen, voltage, current etc. in English when commonly used.
`;
    } else if (languageKey === "Hindi") {
      languageInstruction = `
Explain everything in Hindi language, but write Hindi
using ONLY English alphabet letters (Roman Hindi).

Do NOT use Devanagari script.
Keep technical terms such as photosynthesis, glucose,
oxygen, voltage, current etc. in English when commonly used.
`;
    } else {
      languageInstruction = `
Explain everything in simple English.
`;
    }

    const prompt = `
Explain the educational topic below in a simple way.

Topic: ${normalizedTopic}
Requested Language: ${languageKey}

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
`;

    let result;

    try {
      result = await generateWithRetry(prompt, 2);
    } catch (error) {
      console.error("Gemini API Error:", error);

      if (error?.status === 429) {
        return res.status(200).json({
          simple:
            languageKey === "Telugu"
              ? "Ee topic explanation ippudu temporarily available kaadu. Please konchem sepu tarvata try cheyyandi."
              : languageKey === "Hindi"
              ? "Is topic ka explanation abhi temporarily available nahi hai. Kripya thodi der baad dobara try karein."
              : "This topic explanation is temporarily unavailable. Please try again shortly.",

          steps: [
            "The AI service quota is temporarily exhausted.",
            "Your request was not lost.",
            "Please try again later."
          ],

          analogy:
            "It is like a road with temporary heavy traffic; trying again later should help.",

          fallback: true,
          reason: "Gemini quota or rate limit exceeded"
        });
      }

      if (
        error?.status === 500 ||
        error?.status === 502 ||
        error?.status === 503 ||
        error?.status === 504
      ) {
        return res.status(200).json({
          simple:
            "The AI explanation service is temporarily unavailable. Please try again shortly.",

          steps: [
            "The AI service could not process the request.",
            "Your request reached the backend successfully.",
            "Please try again shortly."
          ],

          analogy:
            "It is like a temporary service interruption; the system can be tried again later.",

          fallback: true,
          reason: "Temporary Gemini service error"
        });
      }

      return res.status(500).json({
        error: "Failed to generate explanation"
      });
    }

    const text = result.response.text();

    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let explanation;

    try {
      explanation = JSON.parse(cleanText);
    } catch (parseError) {
      console.error(
        "Gemini JSON Parse Error:",
        parseError
      );

      return res.status(200).json({
        simple:
          "There was a temporary problem processing the explanation. Please try again.",

        steps: [
          "The AI response was received.",
          "The response format could not be processed correctly.",
          "Please try again."
        ],

        analogy:
          "It is like receiving an answer in a format that needs to be reorganized.",

        fallback: true,
        reason: "Invalid AI response format"
      });
    }

    // Save Gemini-generated explanation to MongoDB
    try {
      await ExplanationCache.findOneAndUpdate(
        {
          topic: normalizedTopic,
          language: normalizedLanguage
        },
        {
          topic: normalizedTopic,
          language: normalizedLanguage,
          response: explanation
        },
        {
          upsert: true,
          new: true
        }
      );

      console.log(
        `Cache SAVED: ${normalizedTopic} - ${normalizedLanguage}`
      );
    } catch (cacheError) {
      console.error(
        "Cache Save Error:",
        cacheError.message
      );
    }

    return res.json(explanation);

  } catch (error) {
    console.error(
      "Explanation Route Error:",
      error
    );

    return res.status(500).json({
      error: "Failed to process explanation request"
    });
  }
});

module.exports = router;