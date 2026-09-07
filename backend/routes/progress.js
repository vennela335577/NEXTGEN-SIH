const express = require("express");
const Progress = require("../models/Progress");

const router = express.Router();

// Save student progress
router.post("/", async (req, res) => {
  try {
    const { userId, topic, status, score } = req.body;

    if (!userId || !topic) {
      return res.status(400).json({
        error: "userId and topic are required"
      });
    }

    const progress = await Progress.create({
      userId,
      topic,
      status,
      score
    });

    res.status(201).json(progress);

  } catch (error) {
    console.error("Progress save error:", error);

    res.status(500).json({
      error: "Failed to save progress"
    });
  }
});

// Get progress summary for a user
router.get("/:userId/summary", async (req, res) => {
  try {
    const { userId } = req.params;

    const progress = await Progress.find({ userId });

    const totalTopics = progress.length;

    const completed = progress.filter(
      item => item.status === "completed"
    ).length;

    const partial = progress.filter(
      item => item.status === "partial"
    ).length;

    const notUnderstood = progress.filter(
      item => item.status === "not-understood"
    ).length;

    const averageScore =
      totalTopics > 0
        ? progress.reduce((sum, item) => sum + item.score, 0) / totalTopics
        : 0;

    res.json({
      totalTopics,
      completed,
      partial,
      notUnderstood,
      averageScore: Math.round(averageScore)
    });

  } catch (error) {
    console.error("Progress summary error:", error);

    res.status(500).json({
      error: "Failed to fetch progress summary"
    });
  }
});

// Get all progress for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const progress = await Progress.find({ userId })
      .sort({ createdAt: -1 });

    res.json(progress);

  } catch (error) {
    console.error("Progress fetch error:", error);

    res.status(500).json({
      error: "Failed to fetch progress"
    });
  }
});

module.exports = router;