const mongoose = require("mongoose");

const explanationCacheSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      index: true
    },

    language: {
      type: String,
      required: true,
      index: true
    },

    response: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: true
  }
);

explanationCacheSchema.index(
  { topic: 1, language: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "ExplanationCache",
  explanationCacheSchema
);