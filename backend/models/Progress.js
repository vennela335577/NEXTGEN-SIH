const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    topic: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["completed", "partial", "not-understood"],
      default: "not-understood"
    },

    score: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Progress", progressSchema);