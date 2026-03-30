const axios = require("axios");

const STALE_DAYS = parseInt(process.env.STALE_DAYS) || 7;
const BLACKHOLE_DAYS = parseInt(process.env.BLACKHOLE_DAYS) || 30;

function daysDiff(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  return Math.floor((now - date) / (1000 * 60 * 60 * 24));
}

function classifyPR(pr, reviews) {
  const age = daysDiff(pr.created_at);
  const lastUpdate = daysDiff(pr.updated_at);
  const hasReviews = reviews && reviews.length > 0;
  const hasApproval = reviews && reviews.some((r) => r.state === "APPROVED");
  const hasChangesRequested = reviews && reviews.some((r) => r.state === "CHANGES_REQUESTED");

  if (age >= BLACKHOLE_DAYS && !hasApproval) return "blackhole";
  if (lastUpdate >= STALE_DAYS && !hasApproval) return "delayed";
  if (!hasReviews && age >= 2) return "idle";
  if (hasChangesRequested) return "changes_requested";
  if (hasApproval) return "approved";
  return "active";
}

async function fetchPRs(owner, repo, token) {
  const headers = {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
  let allPRs = [];
  let page = 1;

  while (page <= 5) {
    const { data } = await axios.get(`${baseUrl}/pulls`, {
      headers,
      params: { state: "open", per_page: 100, page },
    });
    if (!data.length) break;
    allPRs = [...allPRs, ...data];
    page++;
  }

  const enriched = await Promise.all(
    allPRs.slice(0, 50).map(async (pr) => {
      let reviews = [];
      try {
        const { data } = await axios.get(`${baseUrl}/pulls/${pr.number}/reviews`, { headers });
        reviews = data;
      } catch (_) {}

      const reviewerMap = {};
      reviews.forEach((r) => {
        if (!reviewerMap[r.user.login]) reviewerMap[r.user.login] = [];
        reviewerMap[r.user.login].push(r.state);
      });

      return {
        id: pr.number,
        title: pr.title,
        author: pr.user.login,
        authorAvatar: pr.user.avatar_url,
        url: pr.html_url,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        ageDays: daysDiff(pr.created_at),
        lastUpdateDays: daysDiff(pr.updated_at),
        status: classifyPR(pr, reviews),
        reviewers: Object.entries(reviewerMap).map(([login, states]) => ({
          login,
          state: states[states.length - 1],
        })),
        reviewCount: reviews.length,
        labels: pr.labels.map((l) => ({ name: l.name, color: l.color })),
        draft: pr.draft,
        additions: pr.additions || 0,
        deletions: pr.deletions || 0,
        changedFiles: pr.changed_files || 0,
      };
    })
  );

  return enriched;
}

function generateStats(prs) {
  const byStatus = { blackhole: 0, delayed: 0, idle: 0, changes_requested: 0, approved: 0, active: 0 };
  const reviewerLoad = {};
  const authorLoad = {};
  let totalAge = 0;

  prs.forEach((pr) => {
    byStatus[pr.status] = (byStatus[pr.status] || 0) + 1;
    totalAge += pr.ageDays;
    authorLoad[pr.author] = (authorLoad[pr.author] || 0) + 1;
    pr.reviewers.forEach((r) => {
      reviewerLoad[r.login] = (reviewerLoad[r.login] || 0) + 1;
    });
  });

  const topReviewers = Object.entries(reviewerLoad)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([login, count]) => ({ login, count }));

  const topAuthors = Object.entries(authorLoad)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([login, count]) => ({ login, count }));

  const criticalPRs = prs
    .filter((p) => p.status === "blackhole" || p.status === "delayed")
    .sort((a, b) => b.ageDays - a.ageDays)
    .slice(0, 5);

  return {
    total: prs.length,
    byStatus,
    avgAge: prs.length ? Math.round(totalAge / prs.length) : 0,
    topReviewers,
    topAuthors,
    criticalPRs,
    healthScore: Math.max(
      0,
      100 - byStatus.blackhole * 20 - byStatus.delayed * 5 - byStatus.idle * 2
    ),
  };
}

function generateInsights(stats, prs) {
  const insights = [];

  if (stats.byStatus.blackhole > 0) {
    insights.push({
      type: "critical",
      icon: "🕳️",
      title: "PR Blackholes Detected",
      message: `${stats.byStatus.blackhole} PR${stats.byStatus.blackhole > 1 ? "s have" : " has"} been open for ${BLACKHOLE_DAYS}+ days with no approval. These are at high risk of becoming permanently stale.`,
    });
  }

  if (stats.topReviewers[0] && stats.topReviewers[0].count >= 5) {
    insights.push({
      type: "warning",
      icon: "⚡",
      title: "Reviewer Overload",
      message: `${stats.topReviewers[0].login} is assigned to ${stats.topReviewers[0].count} open PRs simultaneously. Consider redistributing the review load.`,
    });
  }

  if (stats.byStatus.idle > 3) {
    insights.push({
      type: "warning",
      icon: "😴",
      title: "Idle PRs Piling Up",
      message: `${stats.byStatus.idle} PRs have received zero reviews. Set up auto-assign rules or designated review windows to prevent further buildup.`,
    });
  }

  if (stats.avgAge > 14) {
    insights.push({
      type: "info",
      icon: "📅",
      title: "High Average PR Age",
      message: `The average PR is ${stats.avgAge} days old. Industry best practice is under 5 days. Consider breaking work into smaller, more reviewable chunks.`,
    });
  }

  if (stats.healthScore >= 80) {
    insights.push({
      type: "success",
      icon: "✅",
      title: "Healthy Pipeline",
      message: `Your PR pipeline scores ${stats.healthScore}/100. Most PRs are flowing well through review cycles.`,
    });
  }

  if (!insights.length) {
    insights.push({
      type: "info",
      icon: "🔍",
      title: "Analysis Complete",
      message: "No critical bottlenecks detected. Keep monitoring for patterns as more PRs are opened.",
    });
  }

  return insights;
}

function getMockData() {
  const mock = [
    { id: 1042, title: "feat: Add OAuth2 SSO integration", author: "alice_dev", authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice", url: "#", created_at: new Date(Date.now() - 45 * 86400000).toISOString(), updated_at: new Date(Date.now() - 38 * 86400000).toISOString(), ageDays: 45, lastUpdateDays: 38, status: "blackhole", reviewers: [], reviewCount: 0, labels: [{ name: "feature", color: "0075ca" }], draft: false, additions: 847, deletions: 12, changedFiles: 23 },
    { id: 1038, title: "fix: Memory leak in WebSocket handler", author: "bob_eng", authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob", url: "#", created_at: new Date(Date.now() - 32 * 86400000).toISOString(), updated_at: new Date(Date.now() - 30 * 86400000).toISOString(), ageDays: 32, lastUpdateDays: 30, status: "blackhole", reviewers: [{ login: "carol_sr", state: "CHANGES_REQUESTED" }], reviewCount: 1, labels: [{ name: "bug", color: "d73a4a" }], draft: false, additions: 42, deletions: 18, changedFiles: 3 },
    { id: 1055, title: "refactor: Migrate to TypeScript strict mode", author: "carol_sr", authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carol", url: "#", created_at: new Date(Date.now() - 18 * 86400000).toISOString(), updated_at: new Date(Date.now() - 14 * 86400000).toISOString(), ageDays: 18, lastUpdateDays: 14, status: "delayed", reviewers: [{ login: "dave_lead", state: "COMMENTED" }], reviewCount: 2, labels: [{ name: "refactor", color: "e4e669" }], draft: false, additions: 1204, deletions: 890, changedFiles: 67 },
    { id: 1061, title: "feat: Dark mode toggle for dashboard", author: "dave_lead", authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dave", url: "#", created_at: new Date(Date.now() - 12 * 86400000).toISOString(), updated_at: new Date(Date.now() - 10 * 86400000).toISOString(), ageDays: 12, lastUpdateDays: 10, status: "delayed", reviewers: [], reviewCount: 0, labels: [{ name: "ui", color: "bfd4f2" }], draft: false, additions: 156, deletions: 8, changedFiles: 9 },
    { id: 1067, title: "test: Increase E2E coverage to 80%", author: "eve_qa", authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=eve", url: "#", created_at: new Date(Date.now() - 8 * 86400000).toISOString(), updated_at: new Date(Date.now() - 8 * 86400000).toISOString(), ageDays: 8, lastUpdateDays: 8, status: "idle", reviewers: [], reviewCount: 0, labels: [{ name: "testing", color: "0e8a16" }], draft: false, additions: 423, deletions: 0, changedFiles: 15 },
    { id: 1071, title: "docs: Update API reference for v3", author: "frank_dw", authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=frank", url: "#", created_at: new Date(Date.now() - 5 * 86400000).toISOString(), updated_at: new Date(Date.now() - 5 * 86400000).toISOString(), ageDays: 5, lastUpdateDays: 5, status: "idle", reviewers: [], reviewCount: 0, labels: [{ name: "documentation", color: "0075ca" }], draft: false, additions: 89, deletions: 34, changedFiles: 6 },
    { id: 1073, title: "feat: Redis caching layer for API", author: "alice_dev", authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice", url: "#", created_at: new Date(Date.now() - 3 * 86400000).toISOString(), updated_at: new Date(Date.now() - 1 * 86400000).toISOString(), ageDays: 3, lastUpdateDays: 1, status: "changes_requested", reviewers: [{ login: "carol_sr", state: "CHANGES_REQUESTED" }], reviewCount: 3, labels: [{ name: "performance", color: "f9d0c4" }], draft: false, additions: 234, deletions: 12, changedFiles: 11 },
    { id: 1075, title: "fix: Race condition in job scheduler", author: "bob_eng", authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob", url: "#", created_at: new Date(Date.now() - 2 * 86400000).toISOString(), updated_at: new Date(Date.now() - 86400000).toISOString(), ageDays: 2, lastUpdateDays: 1, status: "approved", reviewers: [{ login: "dave_lead", state: "APPROVED" }, { login: "carol_sr", state: "APPROVED" }], reviewCount: 4, labels: [{ name: "bug", color: "d73a4a" }, { name: "critical", color: "b60205" }], draft: false, additions: 28, deletions: 14, changedFiles: 2 },
    { id: 1077, title: "feat: Webhook retry mechanism with backoff", author: "carol_sr", authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carol", url: "#", created_at: new Date(Date.now() - 1 * 86400000).toISOString(), updated_at: new Date(Date.now() - 3600000).toISOString(), ageDays: 1, lastUpdateDays: 0, status: "active", reviewers: [{ login: "alice_dev", state: "COMMENTED" }], reviewCount: 1, labels: [{ name: "feature", color: "0075ca" }], draft: false, additions: 112, deletions: 4, changedFiles: 7 },
    { id: 1078, title: "chore: Upgrade dependencies to latest", author: "frank_dw", authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=frank", url: "#", created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date(Date.now() - 7200000).toISOString(), ageDays: 1, lastUpdateDays: 0, status: "active", reviewers: [], reviewCount: 0, labels: [{ name: "chore", color: "e4e669" }], draft: true, additions: 0, deletions: 0, changedFiles: 1 },
  ];
  return mock;
}

module.exports = { fetchPRs, generateStats, generateInsights, getMockData };
