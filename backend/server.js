require("dotenv").config();

const express = require("express");
const explainRoute = require("./routes/explain");
const detectLanguageRoute = require("./routes/detectLanguage");

const app = express();

app.use(express.json());

// API Routes
app.use("/explain", explainRoute);
app.use("/detect-language", detectLanguageRoute);

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