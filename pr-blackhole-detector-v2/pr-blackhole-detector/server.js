require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const prRoutes = require("./routes/prRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "frontend")));

// API Routes
app.use("/api", prRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "PR Blackhole Detector is running 🚀" });
});

// Fallback to frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 PR Blackhole Detector running on http://localhost:${PORT}`);
});

module.exports = app;
