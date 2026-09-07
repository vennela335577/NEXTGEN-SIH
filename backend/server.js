require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Routes
const explainRoute = require("./routes/explain");
const detectLanguageRoute = require("./routes/detectLanguage");
const topicsRoute = require("./routes/topics");
const progressRoute = require("./routes/progress");
const usersRoute = require("./routes/users");
const matchContentRoute = require("./routes/matchContent");

// Database
const connectDB = require("./services/database");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/explain", explainRoute);
app.use("/detect-language", detectLanguageRoute);
app.use("/topics", topicsRoute);
app.use("/progress", progressRoute);
app.use("/users", usersRoute);
app.use("/match-content", matchContentRoute);

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "NEXTGEN Backend is running!"
  });
});

// Start server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});