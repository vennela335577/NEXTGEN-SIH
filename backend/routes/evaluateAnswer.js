const express = require("express");
const model = require("../services/gemini");

const router = express.Router();
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

// Evaluate student's quiz answer
router.post("/", async (req, res) => {
  try {
    const {
      topic,
      question,
      studentAnswer,
      language
    } = req.body;

    // Validate request
    if (!topic || !question || !studentAnswer) {
      return res.status(400).json({
        error: "Topic, question and studentAnswer are required"
      });
    }

    const requestedLanguage = language || "English";

    // AI evaluation prompt
    const prompt = `
You are an educational quiz evaluator.

Topic:
${topic}

Question:
${question}

Student Answer:
${studentAnswer}

Evaluate the student's answer based on:
1. Is it related to the given topic and question?
2. Is the concept scientifically/academically correct?
3. How complete is the answer?

Give a score from 0 to 100.

Scoring rules:
- Wrong or unrelated answer: 0 to 30
- Partially correct answer: 40 to 70
- Correct and relevant answer: 80 to 100

Return ONLY valid JSON in this exact format:

{
  "score": 0,
  "status": "not-understood",
  "feedback": "short explanation"
}

Status rules:
- score 0-30: "not-understood"
- score 40-70: "partial"
- score 80-100: "completed"

Do not give scores between 31-39 or 71-79.

Feedback should be beginner-friendly and concise.
`;

    // Call Gemini
    const result = await generateWithRetry(prompt, 2);

    const text = result.response.text().trim();

    // Remove markdown JSON fences if Gemini adds them
    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const evaluation = JSON.parse(cleanedText);

    // Validate score
    let score = Number(evaluation.score);

    if (score < 0) score = 0;
    if (score > 100) score = 100;

    // Ensure status matches score
    let status;

    if (score <= 30) {
      status = "not-understood";
    } else if (score <= 70) {
      status = "partial";
    } else {
      status = "completed";
    }

    return res.json({
      topic,
      question,
      studentAnswer,
      score,
      status,
      feedback: evaluation.feedback,
      language: requestedLanguage
    });

  } catch (error) {
    console.error("Answer Evaluation Error:", error);

    return res.status(500).json({
      error: "Failed to evaluate student answer"
    });
  }
});

module.exports = router;