# 🕳️ PR Blackhole Detector

🔗 **Live Demo:** https://pr-blackhole-detector.vercel.app

> **“We don’t track code. We track the waiting.”**

A real-time GitHub Pull Request intelligence tool that exposes **hidden delays, silent failures, and bottlenecks** in developer workflows — before they impact delivery.

---

## 🚨 The Problem

Modern engineering teams optimize for:

* Commits
* Velocity
* Deployments

…but ignore the biggest productivity killer:

> ⏳ **Waiting after PR creation**

### ⚠️ What actually happens:

* PRs sit unreviewed for hours (or days)
* Developers context-switch → productivity drops
* Review workload is uneven → bottlenecks form
* Delays stay invisible → until releases slow down

---

### 💥 Real Impact

* 🐌 Slower releases
* 😤 Developer frustration
* 🔁 Context switching overhead
* 📉 Reduced team efficiency

> A delayed PR is not just code waiting — it's **value delayed to users**.

---

## 💡 Our Solution

**PR Blackhole Detector** acts like an X-ray for your development workflow.

It:

* 🔍 Detects hidden PR delays
* 📊 Measures real bottlenecks
* 🧠 Explains issues in plain English
* ⚡ Suggests actionable improvements

---

## ✨ Key Features

| Feature                       | Description                               |
| ----------------------------- | ----------------------------------------- |
| 🕳️ **Blackhole Detection**   | PRs stuck >30 days with no approval       |
| ⏳ **Delay Tracking**          | PRs inactive >7 days                      |
| 😴 **Idle PR Detection**      | PRs with zero reviews                     |
| 📊 **Visual Analytics**       | Charts for PR age & review time           |
| 🧠 **AI Insights**            | Human-readable insights (not raw metrics) |
| ⚖️ **Reviewer Load Analysis** | Detect overloaded reviewers               |
| 💯 **DX Health Score**        | 0–100 score of PR pipeline health         |
| 🛸 **Demo Mode**              | Full working demo without GitHub token    |

---

## 🧠 Example Insight

> “65% of PRs wait more than 8 hours for first review.
> 2 reviewers are handling 80% of PRs — causing delays.”

👉 This is the **hidden bottleneck** most teams never see.

---

## 🎯 Why This Matters

Most tools show:
❌ What happened

We show:
✅ **Why it happened + how to fix it**

---

## 🛠️ Tech Stack

```
Backend:   Node.js · Express · Axios · dotenv
Frontend:  HTML · CSS · JavaScript · Chart.js
Design:    Dark theme · Responsive dashboard · Minimal setup
```

---

## 🚀 How It Works

1. Enter GitHub repository details
2. Fetch PR data via GitHub API
3. Analyze:

   * Time to first review
   * Idle time
   * Reviewer load
4. Detect bottlenecks
5. Generate actionable insights

---

## 📊 Metrics Tracked

* ⏳ Time to first review
* 📅 PR age
* 😴 Idle duration
* 📈 Review coverage
* ⚖️ Reviewer workload

---

## 🧪 PR Classification Logic

| Status               | Meaning               |
| -------------------- | --------------------- |
| 🕳️ Blackhole        | Ignored PR (>30 days) |
| ⏳ Delayed            | No updates (>7 days)  |
| 😴 Idle              | No reviews            |
| 🔁 Changes Requested | Needs updates         |
| ✅ Approved           | Ready to merge        |
| ⚡ Active             | Healthy progress      |

---

## 🏆 What Makes This Unique

✔ Focuses on **hidden waiting time** (not vanity metrics)
✔ Converts raw data → **actionable insights**
✔ Identifies real bottlenecks (review delays, overload)
✔ Simple, fast, and hackathon-ready

---

## 🔮 Future Scope

* Slack / Teams alerts 🚨
* Weekly DX reports 📩
* GitHub App integration 🔗
* Historical analytics 📊
* Reviewer recommendation engine 🤖

---

## ⚡ Quick Start (Local)

```bash
git clone https://github.com/your-username/pr-blackhole-detector.git
cd pr-blackhole-detector
npm install
npm run dev
```

Open:

```
http://localhost:5000
```

---

## ⚙️ Configuration

Create `.env` file:

```env
PORT=5000
GITHUB_TOKEN=your_token_here
STALE_DAYS=7
BLACKHOLE_DAYS=30
```

---

## 🤝 Contributing

PRs welcome — but don’t let them become blackholes 😄

---

## 📜 License

MIT

---

<div align="center">

## 🕊️ Motto

### **X-Ray Your DX**

Expose the invisible.
Fix what slows developers down.

---

**Built for Hackathon 2026 🚀**

</div>
