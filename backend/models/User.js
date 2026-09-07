const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    language: {
      type: String,
      default: "English"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);