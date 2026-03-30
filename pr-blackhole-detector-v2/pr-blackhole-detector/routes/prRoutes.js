const express = require("express");
const router = express.Router();
const { fetchPRs, generateStats, generateInsights, getMockData } = require("../services/githubService");

// Main scan endpoint
router.post("/scan", async (req, res) => {
  const { owner, repo, token } = req.body;
  if (!owner || !repo) {
    return res.status(400).json({ error: "owner and repo are required" });
  }
  try {
    const prs = await fetchPRs(owner, repo, token || process.env.GITHUB_TOKEN);
    const stats = generateStats(prs);
    const insights = generateInsights(stats, prs);
    res.json({ prs, stats, insights, repo: `${owner}/${repo}` });
  } catch (err) {
    const status = err.response?.status || 500;
    const message =
      status === 404
        ? "Repository not found. Check owner and repo name."
        : status === 403
        ? "GitHub API rate limit exceeded. Please provide a Personal Access Token."
        : status === 401
        ? "Invalid GitHub token."
        : err.message || "Failed to fetch PRs";
    res.status(status >= 400 && status < 500 ? status : 500).json({ error: message });
  }
});

// Demo mode
router.get("/demo", (req, res) => {
  const prs = getMockData();
  const stats = generateStats(prs);
  const insights = generateInsights(stats, prs);
  res.json({ prs, stats, insights, repo: "acme-corp/platform", demo: true });
});

// Health
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = router;
