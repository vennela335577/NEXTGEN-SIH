require("dotenv").config();

const express = require("express");
const cors = require("cors");

const explainRoute = require("./routes/explain");
const detectLanguageRoute = require("./routes/detectLanguage");
const topicsRoute = require("./routes/topics");

const app = express();

// Enable CORS
app.use(cors());

app.use(express.json());

// API Routes
app.use("/explain", explainRoute);
app.use("/detect-language", detectLanguageRoute);
app.use("/topics", topicsRoute);

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "NEXTGEN Backend is running!"
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});