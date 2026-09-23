import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function AnalyticsPage({
  onBack,
  onDashboard,
  onPosts,
  onSchedules,
  onAI,
  onAnalytics,
}) {
  const [posts, setPosts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [postsResponse, schedulesResponse] = await Promise.all([
        api.get("/posts"),
        api.get("/schedules"),
      ]);

      setPosts(postsResponse.data?.data || []);
      setSchedules(schedulesResponse.data?.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load analytics. Please check the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const stats = useMemo(() => {
    const totalPosts = posts.length;

    const published = posts.filter(
      (post) => String(post.status).toUpperCase() === "PUBLISHED"
    ).length;

    const drafts = posts.filter(
      (post) => String(post.status).toUpperCase() === "DRAFT"
    ).length;

    const scheduled = schedules.filter(
      (item) => String(item.status).toUpperCase() === "SCHEDULED"
    ).length;

    const totalWords = posts.reduce(
      (sum, post) => sum + Number(post.wordCount || 0),
      0
    );

    const averageWords =
      totalPosts > 0 ? Math.round(totalWords / totalPosts) : 0;

    const publishedRatio =
      totalPosts > 0 ? Math.round((published / totalPosts) * 100) : 0;

    return {
      totalPosts,
      published,
      drafts,
      scheduled,
      totalWords,
      averageWords,
      publishedRatio,
    };
  }, [posts, schedules]);

  const platformStats = useMemo(() => {
    const platforms = ["Twitter", "Instagram", "Facebook"];

    return platforms.map((platform) => {
      const count = posts.filter(
        (post) =>
          String(post.platform).toLowerCase() === platform.toLowerCase()
      ).length;

      const percentage =
        posts.length > 0 ? Math.round((count / posts.length) * 100) : 0;

      return {
        platform,
        count,
        percentage,
      };
    });
  }, [posts]);

  const statusStats = useMemo(() => {
    return [
      {
        label: "Published",
        value: stats.published,
        className: "published",
      },
      {
        label: "Drafts",
        value: stats.drafts,
        className: "drafts",
      },
      {
        label: "Scheduled",
        value: stats.scheduled,
        className: "scheduled",
      },
      {
        label: "Failed",
        value: 0,
        className: "failed",
      },
    ];
  }, [stats]);

  const maxStatusValue = Math.max(
    ...statusStats.map((item) => item.value),
    1
  );

  const latestPosts = [...posts]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 3);

  const totalPlatformPosts = posts.length;

  const twitterPercentage =
    totalPlatformPosts > 0
      ? Math.round(
          (platformStats.find((item) => item.platform === "Twitter")
            ?.count /
            totalPlatformPosts) *
            100
        )
      : 0;

  const instagramPercentage =
    totalPlatformPosts > 0
      ? Math.round(
          (platformStats.find((item) => item.platform === "Instagram")
            ?.count /
            totalPlatformPosts) *
            100
        )
      : 0;

  const facebookPercentage =
    totalPlatformPosts > 0
      ? Math.round(
          (platformStats.find((item) => item.platform === "Facebook")
            ?.count /
            totalPlatformPosts) *
            100
        )
      : 0;

  const donutStyle =
    totalPlatformPosts === 0
      ? {
          background:
            "conic-gradient(#1c263b 0deg 360deg)",
        }
      : {
          background: `conic-gradient(
            #5b6cff 0deg ${twitterPercentage * 3.6}deg,
            #ec4899 ${twitterPercentage * 3.6}deg ${
              (twitterPercentage + instagramPercentage) * 3.6
            }deg,
            #2563eb ${
              (twitterPercentage + instagramPercentage) * 3.6
            }deg 360deg
          )`,
        };

  const formatDate = (date) => {
    if (!date) return "Recently created";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Recently created";
    }

    return parsed.toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="analytics-page">
      {/* SIDEBAR */}

      <aside className="analytics-sidebar">
        <div className="analytics-brand">
          <div className="analytics-brand-icon">PX</div>

          <div>
            <strong>EXP 5</strong>
            <span>Command Center</span>
          </div>
        </div>

        <nav className="analytics-nav">
          <button
            className="analytics-nav-item"
            onClick={onDashboard || onBack}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button className="analytics-nav-item" onClick={onPosts}>
            <span>◇</span>
            Posts
          </button>

          <button className="analytics-nav-item" onClick={onSchedules}>
            <span>◷</span>
            Schedules
          </button>

          <button className="analytics-nav-item" onClick={onAI}>
            <span>✦</span>
            AI Assistant
          </button>

          <button className="analytics-nav-item active">
            <span>▥</span>
            Analytics
          </button>
        </nav>

        <div className="analytics-user">
          <div className="analytics-user-avatar">A</div>

          <div>
            <strong>admin@exp5.com</strong>
            <span>ADMIN</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}

      <main className="analytics-main">
        <div className="analytics-topbar">
          <div>
            <span className="analytics-eyebrow">
              PERFORMANCE INSIGHTS
            </span>

            <h1>Analytics</h1>

            <p>
              Track your content activity and publishing statistics.
            </p>
          </div>

          <div className="analytics-actions">
            <button
              className="analytics-outline-button"
              onClick={loadAnalytics}
            >
              ↻ Refresh
            </button>

            <button
              className="analytics-outline-button"
              onClick={onBack || onDashboard}
            >
              ← Dashboard
            </button>
          </div>
        </div>

        {error && <div className="analytics-error">{error}</div>}

        {/* STAT CARDS */}

        <section className="analytics-stat-grid">
          <div className="analytics-stat-card">
            <div className="analytics-stat-icon blue">▣</div>

            <div className="analytics-stat-content">
              <span>Total Posts</span>
              <strong>{loading ? "—" : stats.totalPosts}</strong>
              <small>
                {stats.totalPosts > 0
                  ? "All created content"
                  : "No content yet"}
              </small>
            </div>

            <div className="analytics-stat-line blue-line" />
          </div>

          <div className="analytics-stat-card">
            <div className="analytics-stat-icon green">▶</div>

            <div className="analytics-stat-content">
              <span>Published</span>
              <strong>{loading ? "—" : stats.published}</strong>
              <small>{stats.publishedRatio}% of total posts</small>
            </div>

            <div className="analytics-stat-line green-line" />
          </div>

          <div className="analytics-stat-card">
            <div className="analytics-stat-icon purple">✎</div>

            <div className="analytics-stat-content">
              <span>Drafts</span>
              <strong>{loading ? "—" : stats.drafts}</strong>
              <small>
                {stats.totalPosts > 0
                  ? `${Math.round(
                      (stats.drafts / stats.totalPosts) * 100
                    )}% of total posts`
                  : "No drafts"}
              </small>
            </div>

            <div className="analytics-stat-line purple-line" />
          </div>

          <div className="analytics-stat-card">
            <div className="analytics-stat-icon orange">◷</div>

            <div className="analytics-stat-content">
              <span>Scheduled</span>
              <strong>{loading ? "—" : stats.scheduled}</strong>
              <small>{stats.scheduled} upcoming posts</small>
            </div>

            <div className="analytics-stat-line orange-line" />
          </div>
        </section>

        {/* CHARTS */}

        <section className="analytics-chart-grid">
          {/* PLATFORM */}

          <div className="analytics-panel platform-panel">
            <div className="analytics-panel-header">
              <div className="analytics-panel-title">
                <div className="analytics-panel-icon">◔</div>

                <div>
                  <h2>Platform Activity</h2>
                  <p>
                    Distribution of posts across social media platforms.
                  </p>
                </div>
              </div>

              <select className="analytics-select" defaultValue="all">
                <option value="all">All Platforms</option>
                <option value="twitter">Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>

            <div className="platform-chart">
              <div
                className="analytics-donut"
                style={donutStyle}
              >
                <div className="analytics-donut-inner">
                  <strong>{totalPlatformPosts}</strong>
                  <span>Total Posts</span>
                </div>
              </div>

              <div className="platform-legend">
                {platformStats.map((item) => (
                  <div className="platform-legend-row" key={item.platform}>
                    <div className="platform-name">
                      <span
                        className={`platform-dot ${item.platform.toLowerCase()}`}
                      />

                      <strong>{item.platform}</strong>
                    </div>

                    <strong>{item.count}</strong>

                    <span>{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STATUS */}

          <div className="analytics-panel status-panel">
            <div className="analytics-panel-header">
              <div className="analytics-panel-title">
                <div className="analytics-panel-icon">▥</div>

                <div>
                  <h2>Content Status</h2>
                  <p>Overview of your content by status.</p>
                </div>
              </div>

              <select className="analytics-select" defaultValue="all">
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="week">This Week</option>
              </select>
            </div>

            <div className="status-chart">
              {statusStats.map((item) => {
                const height =
                  item.value === 0
                    ? 4
                    : Math.max(
                        12,
                        (item.value / maxStatusValue) * 100
                      );

                return (
                  <div className="status-column" key={item.label}>
                    <div className="status-value">
                      {item.value}
                    </div>

                    <div className="status-bar-area">
                      <div
                        className={`status-bar ${item.className}`}
                        style={{ height: `${height}%` }}
                      />
                    </div>

                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CONTENT SUMMARY */}

        <section className="analytics-summary-grid">
          <div className="analytics-summary-card">
            <span>Total Words</span>
            <strong>{stats.totalWords}</strong>
            <small>Across all posts</small>
          </div>

          <div className="analytics-summary-card">
            <span>Average Words / Post</span>
            <strong>{stats.averageWords}</strong>
            <small>Average content length</small>
          </div>

          <div className="analytics-summary-card">
            <span>Published Ratio</span>
            <strong>{stats.publishedRatio}%</strong>
            <small>Published vs total</small>
          </div>

          <div className="analytics-summary-card">
            <span>Scheduled Items</span>
            <strong>{schedules.length}</strong>
            <small>Automation queue</small>
          </div>
        </section>

        {/* RECENT CONTENT */}

        <section className="analytics-panel recent-content-panel">
          <div className="analytics-panel-header">
            <div className="analytics-panel-title">
              <div className="analytics-panel-icon">▣</div>

              <div>
                <h2>Recent Content</h2>
                <p>Your latest posts and their performance.</p>
              </div>
            </div>

            <div className="analytics-live">
              <span />
              LIVE DATA
            </div>
          </div>

          {latestPosts.length === 0 ? (
            <div className="analytics-empty">
              <div className="analytics-empty-icon">◇</div>
              <h3>No activity yet</h3>
              <p>Create a post to see analytics here.</p>
            </div>
          ) : (
            <div className="analytics-recent-list">
              {latestPosts.map((post) => (
                <article className="analytics-recent-item" key={post.id}>
                  <div className="recent-platform-icon">
                    {String(post.platform).toLowerCase() === "twitter"
                      ? "𝕏"
                      : String(post.platform).toLowerCase() ===
                        "instagram"
                      ? "◎"
                      : "f"}
                  </div>

                  <div className="recent-post-content">
                    <div className="recent-post-title">
                      <strong>{post.platform} post</strong>

                      <span
                        className={`recent-status ${String(
                          post.status
                        ).toLowerCase()}`}
                      >
                        {post.status}
                      </span>
                    </div>

                    <p>{post.content}</p>

                    <div className="recent-post-meta">
                      <span>{formatDate(post.createdAt)}</span>
                      <span>•</span>
                      <span>{post.wordCount || 0} words</span>
                    </div>
                  </div>

                  <div className="recent-metrics">
                    <div>
                      <strong>0</strong>
                      <span>Views</span>
                    </div>

                    <div>
                      <strong>0</strong>
                      <span>Likes</span>
                    </div>

                    <div>
                      <strong>0</strong>
                      <span>Comments</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AnalyticsPage;