import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard({
  user,
  onLogout,
  onPosts,
  onSchedules,
  onAI,
  onAnalytics,
}) {
  const [posts, setPosts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [postsResponse, schedulesResponse] = await Promise.all([
        api.get("/posts"),
        api.get("/schedules"),
      ]);

      const postData = postsResponse.data?.data || [];
      const scheduleData = schedulesResponse.data?.data || [];

      setPosts(Array.isArray(postData) ? postData : []);
      setSchedules(Array.isArray(scheduleData) ? scheduleData : []);

      try {
        await api.get("/health");
        setApiOnline(true);
      } catch {
        setApiOnline(false);
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
      setApiOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalPosts = posts.length;

  const publishedPosts = posts.filter(
    (post) => String(post.status).toUpperCase() === "PUBLISHED"
  ).length;

  const draftPosts = posts.filter(
    (post) => String(post.status).toUpperCase() === "DRAFT"
  ).length;

  const scheduledPosts = schedules.length;

  const getInitials = () => {
    const email = user?.email || "Admin";
    return email.substring(0, 1).toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return "--";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "--";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatScheduleDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <div className="dashboard-layout">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="brand-icon">P</div>

          <div>
            <strong>PulseAPI</strong>
            <span>Content Command Center</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <button
            className="nav-item active"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span>⌂</span>
            <label>Dashboard</label>
          </button>

          <button
            className="nav-item"
            onClick={onPosts}
          >
            <span>▣</span>
            <label>Posts</label>
          </button>

          <button
            className="nav-item"
            onClick={onSchedules}
          >
            <span>◷</span>
            <label>Schedules</label>
          </button>

          <button
            className="nav-item"
            onClick={onAI}
          >
            <span>✦</span>
            <label>AI Assistant</label>
          </button>

          <button
            className="nav-item"
            onClick={onAnalytics}
          >
            <span>◈</span>
            <label>Analytics</label>
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="user-mini">

            <div className="avatar">
              {getInitials()}
            </div>

            <div>
              <strong>
                {user?.email || "Admin"}
              </strong>

              <span>Workspace Admin</span>
            </div>

          </div>

          <button
            className="logout-button"
            onClick={onLogout}
          >
            Logout
          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="dashboard-main">

        {/* TOP BAR */}

        <header className="topbar">

          <div>
            <div className="eyebrow">
              COMMAND CENTER
            </div>

            <h1>Dashboard</h1>

            <p className="page-description">
              Manage your content, schedules and AI-powered workflow.
            </p>
          </div>

          <div className="topbar-actions">

            <div
              className={`api-status ${
                apiOnline ? "online" : "offline"
              }`}
            >
              <span></span>

              {apiOnline
                ? "API Online"
                : "API Offline"}
            </div>

            <div className="top-avatar">
              {getInitials()}
            </div>

          </div>

        </header>

        {/* ================= STATS ================= */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon">
              ▣
            </div>

            <div>
              <span>Total Posts</span>
              <strong>
                {loading ? "—" : totalPosts}
              </strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              ✓
            </div>

            <div>
              <span>Published</span>
              <strong>
                {loading ? "—" : publishedPosts}
              </strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              ✎
            </div>

            <div>
              <span>Drafts</span>
              <strong>
                {loading ? "—" : draftPosts}
              </strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              ◷
            </div>

            <div>
              <span>Scheduled</span>
              <strong>
                {loading ? "—" : scheduledPosts}
              </strong>
            </div>

          </div>

        </section>

        {/* ================= CONTENT ================= */}

        <section className="dashboard-grid">

          {/* RECENT POSTS */}

          <div className="content-card">

            <div className="card-header">

              <div>
                <div className="card-label">
                  CONTENT
                </div>

                <h2>Recent Posts</h2>
              </div>

              <button
                className="secondary-button"
                onClick={onPosts}
              >
                View all →
              </button>

            </div>

            {posts.length === 0 ? (

              <div className="empty-state">

                <div>

                  <div className="empty-icon">
                    ◇
                  </div>

                  <h3>No posts yet</h3>

                  <p>
                    Create your first social media post.
                  </p>

                  <button
                    className="primary-button"
                    onClick={onPosts}
                  >
                    Create Post
                  </button>

                </div>

              </div>

            ) : (

              <div className="post-list">

                {posts.slice(0, 4).map((post) => (

                  <div
                    className="post-row"
                    key={post.id}
                  >

                    <div className="platform-icon">
                      {post.platform === "Instagram"
                        ? "◎"
                        : post.platform === "Facebook"
                        ? "f"
                        : "𝕏"}
                    </div>

                    <div className="post-info">

                      <strong>
                        {post.platform || "Social Post"}
                      </strong>

                      <p>
                        {post.content || "No content"}
                      </p>

                      <small>
                        {formatDate(post.createdAt)}
                      </small>

                    </div>

                    <span
                      className={`status-badge ${
                        String(post.status)
                          .toLowerCase()
                      }`}
                    >
                      {post.status || "DRAFT"}
                    </span>

                  </div>

                ))}

              </div>

            )}

          </div>

          {/* UPCOMING SCHEDULES */}

          <div className="content-card">

            <div className="card-header">

              <div>
                <div className="card-label">
                  AUTOMATION
                </div>

                <h2>Upcoming</h2>
              </div>

              <button
                className="secondary-button"
                onClick={onSchedules}
              >
                View all →
              </button>

            </div>

            {schedules.length === 0 ? (

              <div className="empty-state compact">

                <div>

                  <div className="empty-icon">
                    ◷
                  </div>

                  <h3>No schedules</h3>

                  <p>
                    Your upcoming schedules will
                    appear here.
                  </p>

                  <button
                    className="primary-button"
                    onClick={onSchedules}
                  >
                    Create Schedule
                  </button>

                </div>

              </div>

            ) : (

              <div className="schedule-list">

                {schedules
                  .slice(0, 4)
                  .map((schedule) => (

                    <div
                      className="schedule-item"
                      key={schedule.id}
                    >

                      <div className="schedule-date">
                        {formatScheduleDate(
                          schedule.scheduledAt
                        )}
                      </div>

                      <div>

                        <strong>
                          {schedule.title ||
                            "Scheduled Post"}
                        </strong>

                        <p>
                          {schedule.platform ||
                            "Social Media"}
                        </p>

                      </div>

                    </div>

                  ))}

              </div>

            )}

          </div>

        </section>

        {/* ================= ANALYTICS BANNER ================= */}

        <section className="ai-banner">

          <div className="ai-symbol">
            ◈
          </div>

          <div>
            <div className="card-label">
              INSIGHTS
            </div>

            <h2>
              Content performance
            </h2>

            <p>
              View platform distribution,
              publishing activity and content
              insights.
            </p>
          </div>

          <button
            className="primary-button ai-button"
            onClick={onAnalytics}
          >
            Open Analytics →
          </button>

        </section>

        {/* ================= AI BANNER ================= */}

        <section className="ai-banner">

          <div className="ai-symbol">
            ✦
          </div>

          <div>
            <div className="card-label">
              OLLAMA + RAG
            </div>

            <h2>
              AI knowledge assistant
            </h2>

            <p>
              Ask questions using your local
              knowledge base and AI-powered
              retrieval.
            </p>
          </div>

          <button
            className="primary-button ai-button"
            onClick={onAI}
          >
            Open AI Assistant →
          </button>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;