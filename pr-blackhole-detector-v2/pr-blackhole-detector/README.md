# 🕳️ PR Blackhole Detector

> **"Every PR that dies in review is a feature your users never got."**

A real-time GitHub Pull Request intelligence dashboard that hunts down bottlenecks, flags review overload, and generates plain-English insights so your team can stop losing work to the void.

---

## 🏆 What Problem Does This Solve?

Most engineering teams have **no visibility** into their PR pipeline until it's too late:
- A critical bug fix sits unreviewed for **6 weeks** — nobody noticed.
- One senior engineer is assigned **12 open PRs** simultaneously — they're drowning.
- Junior developers open PRs and **never hear back** — they quit.

PR Blackhole Detector shines a light on these invisible failures **before they become people problems.**

---

## ✨ Features

| Feature | Description |
|---|---|
| 🕳️ **Blackhole Detection** | PRs open 30+ days with no approval — surfaced instantly |
| ⏳ **Delay Tracking** | PRs stale for 7+ days — shown with exact staleness |
| 😴 **Idle PR Alerts** | PRs with zero reviews — the most dangerous silent killers |
| 📊 **Visual Analytics** | Status donut + age distribution bar chart |
| 🤖 **AI-Style Insights** | Plain-English summaries: "Alice is overloaded with 8 PRs" |
| ⚡ **Filter & Sort** | One-click filtering by status, sorted by severity |
| 🛸 **Demo Mode** | Full working demo — no GitHub token required |
| 💯 **Health Score** | 0–100 pipeline score with real-time calculation |

---

## 🎨 Tech Stack

```
Backend:   Express (Node.js) · Axios · dotenv
Frontend:  Vanilla HTML/CSS/JS · Chart.js
Fonts:     Syne (display) · Space Mono (code)
Design:    Dark space theme · CSS animations · Responsive
```

No React, no build step, no bundler. It just works.

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-username/pr-blackhole-detector.git
cd pr-blackhole-detector
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
GITHUB_TOKEN=ghp_your_token_here   # optional but recommended
STALE_DAYS=7                        # days before a PR is "delayed"
BLACKHOLE_DAYS=30                   # days before a PR is a "blackhole"
```

> **No token?** You'll be limited to ~60 GitHub API requests/hour. A token bumps this to 5,000/hour. [Create one here →](https://github.com/settings/tokens)

### 3. Start the Server

```bash
npm run dev     # development (hot reload)
npm start       # production
```

Open **http://localhost:5000** in your browser. Done.

---

## 🧭 How to Use

1. **Enter** a GitHub owner (e.g. `facebook`) and repo (e.g. `react`)
2. **Optionally** paste your GitHub Personal Access Token
3. Hit **⚡ Scan PRs** — the dashboard populates in seconds
4. Use **filter buttons** to zoom in on Blackholes, Idle PRs, etc.
5. Read the **AI Insights** panel on the right for actionable summaries
6. No token? Hit **🛸 Demo Mode** to see the full experience with synthetic data

---

## 📐 PR Classification Logic

| Status | Criteria |
|---|---|
| 🕳️ **Blackhole** | Open 30+ days, no approval |
| ⏳ **Delayed** | No update in 7+ days, no approval |
| 😴 **Idle** | No reviews at all, open 2+ days |
| 🔁 **Changes Requested** | Reviewer requested changes |
| ✅ **Approved** | At least one approval |
| ⚡ **Active** | Recent activity, moving through pipeline |

Thresholds are fully configurable via `.env`.

---

## 📂 Project Structure

```
pr-blackhole-detector/
├── server.js                # Express entry point
├── routes/
│   └── prRoutes.js          # /api/scan, /api/demo, /api/health
├── services/
│   └── githubService.js     # GitHub API, classification, stats, insights
├── frontend/
│   └── index.html           # Self-contained dashboard (no build step)
├── .env.example             # Environment variable template
├── nodemon.json             # Dev watch config
└── package.json
```

---

## 🔌 API Reference

### `POST /api/scan`
Scan a GitHub repository for PR insights.

**Body:**
```json
{
  "owner": "facebook",
  "repo": "react",
  "token": "ghp_optional"
}
```

**Response:**
```json
{
  "prs": [...],
  "stats": {
    "total": 10,
    "byStatus": { "blackhole": 2, "delayed": 1, ... },
    "avgAge": 18,
    "healthScore": 62,
    "topReviewers": [...],
    "topAuthors": [...]
  },
  "insights": [
    { "type": "critical", "icon": "🕳️", "title": "...", "message": "..." }
  ]
}
```

### `GET /api/demo`
Returns realistic mock data — no authentication required.

### `GET /api/health`
Server health check.

---

## 🔮 Roadmap

- [ ] Slack / Teams webhook notifications for new blackholes
- [ ] Weekly digest email reports
- [ ] GitHub App integration for automatic PR labeling
- [ ] Historical trend tracking (SQLite)
- [ ] Team comparison mode (multi-repo)
- [ ] Reviewer recommendation engine

---

## 🤝 Contributing

PRs welcome! (Don't let them become blackholes 😄)

```bash
git checkout -b feat/your-feature
# make your changes
git commit -m "feat: your feature"
git push origin feat/your-feature
# open a PR — we review fast, we promise
```

---

## 📄 License

MIT — free to use, fork, and deploy.

---

<div align="center">

**Built with ❤️ for Hackathon 2026**

*Stop losing code to the void.*

</div>
