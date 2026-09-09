const express = require("express");
const model = require("../services/gemini");
const ExplanationCache = require("../models/ExplanationCache");
const {
  normalizeTopic,
  normalizeLanguage
} = require("../utils/normalize");

const router = express.Router();


// Retry helper for temporary Gemini errors
async function generateWithRetry(prompt, maxRetries = 2) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      lastError = error;

      const status = error?.status;

      // 429 = quota/rate limit.
      // Retrying immediately will not solve a quota problem.
      if (status === 429) {
        throw error;
      }

      // Retry only temporary server/network errors
      const temporaryError =
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504;

      if (!temporaryError || attempt === maxRetries) {
        throw error;
      }

      // Short delay before retry
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


    // Normalize topic and language
    const normalizedTopic = normalizeTopic(topic);
    const normalizedLanguage = normalizeLanguage(language);


    // --------------------------------------------------
    // STEP 1: CHECK MONGODB CACHE
    // --------------------------------------------------

    const cachedExplanation = await ExplanationCache.findOne({
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


    // --------------------------------------------------
    // STEP 2: LANGUAGE INSTRUCTION
    // --------------------------------------------------

    let languageInstruction = "";

    if (normalizedLanguage === "telugu") {
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

    } else if (normalizedLanguage === "hindi") {
      languageInstruction = `
Explain everything in Hindi language, but write Hindi using ONLY English
alphabet letters (Roman Hindi).

Do NOT use Devanagari script.

Keep technical terms such as photosynthesis, glucose, oxygen,
voltage, current etc. in English when they are commonly used.
`;

    } else {
      languageInstruction = `
Explain everything in simple English.
`;
    }


    // --------------------------------------------------
    // STEP 3: GEMINI PROMPT
    // --------------------------------------------------

    const prompt = `
Explain the educational topic below in a simple way.

Topic: ${normalizedTopic}
Requested Language: ${normalizedLanguage}

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


    // --------------------------------------------------
    // STEP 4: CALL GEMINI WITH RETRY
    // --------------------------------------------------

    let result;

    try {
      result = await generateWithRetry(prompt, 2);
    } catch (error) {
      console.error("Gemini API Error:", error);


      // ------------------------------------------------
      // 429 QUOTA / RATE LIMIT FALLBACK
      // ------------------------------------------------

      if (error?.status === 429) {
        return res.status(200).json({
          simple:
            normalizedLanguage === "telugu"
              ? "Ee topic explanation ippudu temporarily available kaadu. Please konchem sepu tarvata try cheyyandi."
              : normalizedLanguage === "hindi"
              ? "Is topic ka explanation abhi temporarily available nahi hai. Kripya thodi der baad dobara try karein."
              : "This topic explanation is temporarily unavailable. Please try again shortly.",

          steps: [
            normalizedLanguage === "telugu"
              ? "Gemini service quota temporarily exhausted."
              : normalizedLanguage === "hindi"
              ? "Gemini service quota temporarily exhausted hai."
              : "The AI service quota is temporarily exhausted.",

            normalizedLanguage === "telugu"
              ? "Your request was not lost."
              : normalizedLanguage === "hindi"
              ? "Aapki request lost nahi hui hai."
              : "Your request was not lost.",

            normalizedLanguage === "telugu"
              ? "Please try again later."
              : normalizedLanguage === "hindi"
              ? "Kripya baad mein dobara try karein."
              : "Please try again later."
          ],

          analogy:
            normalizedLanguage === "telugu"
              ? "Idi traffic ekkuva unna road laanti situation; konchem sepu tarvata malli try cheyyachu."
              : normalizedLanguage === "hindi"
              ? "Yeh zyada traffic wali road jaisi situation hai; thodi der baad dobara try kar sakte hain."
              : "It is like a road with temporary heavy traffic; trying again later should help.",

          fallback: true,
          reason: "Gemini quota or rate limit exceeded"
        });
      }


      // ------------------------------------------------
      // TEMPORARY SERVER ERROR FALLBACK
      // ------------------------------------------------

      if (
        error?.status === 500 ||
        error?.status === 502 ||
        error?.status === 503 ||
        error?.status === 504
      ) {
        return res.status(200).json({
          simple:
            normalizedLanguage === "telugu"
              ? "AI explanation service ippudu temporarily unavailable undi. Please konchem sepu tarvata try cheyyandi."
              : normalizedLanguage === "hindi"
              ? "AI explanation service abhi temporarily unavailable hai. Kripya thodi der baad try karein."
              : "The AI explanation service is temporarily unavailable. Please try again shortly.",

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


      // Other unexpected Gemini errors
      return res.status(500).json({
        error: "Failed to generate explanation",
        message: "The AI service encountered an unexpected error."
      });
    }


    // --------------------------------------------------
    // STEP 5: PARSE GEMINI RESPONSE
    // --------------------------------------------------

    const text = result.response.text();

    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let explanation;

    try {
      explanation = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Gemini JSON Parse Error:", parseError);

      return res.status(200).json({
        simple:
          normalizedLanguage === "telugu"
            ? "Explanation format lo temporary problem vachindi. Please malli try cheyyandi."
            : normalizedLanguage === "hindi"
            ? "Explanation format mein temporary problem aayi hai. Kripya dobara try karein."
            : "There was a temporary problem processing the explanation. Please try again.",

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


    // --------------------------------------------------
    // STEP 6: SAVE SUCCESSFUL RESPONSE TO CACHE
    // --------------------------------------------------

    try {
      await ExplanationCache.create({
        topic: normalizedTopic,
        language: normalizedLanguage,
        response: explanation
      });

      console.log(
        `Cache SAVED: ${normalizedTopic} - ${normalizedLanguage}`
      );

    } catch (cacheError) {
      // Do not fail the user's successful request
      // just because saving cache failed.
      console.error("Cache Save Error:", cacheError.message);
    }


    // --------------------------------------------------
    // STEP 7: RETURN EXPLANATION
    // --------------------------------------------------

    return res.json(explanation);

  } catch (error) {
    console.error("Explanation Route Error:", error);

    return res.status(500).json({
      error: "Failed to process explanation request"
    });
  }
});


module.exports = router;