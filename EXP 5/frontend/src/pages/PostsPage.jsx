import { useEffect, useState } from "react";
import api from "../services/api";

function PostsPage({
  onBack,
  onDashboard,
  onPosts,
  onSchedules,
  onAI,
  onAnalytics,
}) {
  const [posts, setPosts] = useState([]);

  const [platform, setPlatform] = useState("Twitter");
  const [status, setStatus] = useState("DRAFT");
  const [tone, setTone] = useState("Professional");
  const [content, setContent] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // AI generator
  const [showGenerator, setShowGenerator] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("Professional");
  const [generating, setGenerating] = useState(false);

  // AI analyzer
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/posts");

      const data = response.data?.data;

      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error("Load posts error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load posts. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPlatform("Twitter");
    setStatus("DRAFT");
    setTone("Professional");
    setContent("");

    setEditingId(null);

    setShowGenerator(false);
    setAiTopic("");
    setAiTone("Professional");

    setAnalysisResult(null);
    setAnalysisError("");

    setError("");
  };

  const startEditing = (post) => {
    setEditingId(post.id);

    setPlatform(post.platform || "Twitter");
    setStatus(post.status || "DRAFT");
    setContent(post.content || "");

    setTone("Professional");

    setAnalysisResult(null);
    setAnalysisError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const savePost = async () => {
    if (!content.trim()) {
      setError("Please enter post content.");
      return;
    }

    if (content.length > 280) {
      setError("Post content cannot exceed 280 characters.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const postData = {
        platform,
        content: content.trim(),
        wordCount: content.trim().split(/\s+/).length,
        status,
      };

      if (editingId) {
        await api.put(`/posts/${editingId}`, postData);
        setSuccess("Post updated successfully.");
      } else {
        await api.post("/posts", postData);
        setSuccess("Post created successfully.");
      }

      await loadPosts();

      setTimeout(() => {
        setSuccess("");
      }, 2500);

      resetForm();
    } catch (err) {
      console.error("Save post error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save post. Please check the backend."
      );
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(`/posts/${id}`);

      setPosts((currentPosts) =>
        currentPosts.filter((post) => post.id !== id)
      );

      setSuccess("Post deleted successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Delete post error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete the post."
      );
    }
  };

  // ---------------------------------------------------------
  // OLLAMA AI POST GENERATOR
  // ---------------------------------------------------------

  const generatePost = async () => {
    if (!aiTopic.trim()) {
      setError("Enter a topic for the AI generator.");
      return;
    }

    try {
      setGenerating(true);
      setError("");

      const response = await api.post("/ai/generate-post", {
        topic: aiTopic.trim(),
        platform,
        tone: aiTone,
      });

      const generatedContent =
        response.data?.data?.content ||
        response.data?.content ||
        "";

      if (!generatedContent) {
        throw new Error("No generated content received.");
      }

      setContent(generatedContent.slice(0, 280));

      setTone(aiTone);

      setAnalysisResult(null);
      setAnalysisError("");

      setSuccess("AI generated content added to your post.");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("AI generator error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to generate content with Ollama."
      );
    } finally {
      setGenerating(false);
    }
  };

  // ---------------------------------------------------------
  // AI CONTENT ANALYZER
  // ---------------------------------------------------------

  const analyzeContent = async () => {
    if (!content.trim()) {
      setAnalysisError("Enter some content before analyzing it.");
      return;
    }

    try {
      setAnalyzing(true);
      setAnalysisError("");
      setAnalysisResult(null);

      const response = await api.post("/ai/analyze", {
        content: content.trim(),
        platform,
        tone,
      });

      const result = response.data?.data ?? response.data;

      setAnalysisResult(result);
    } catch (err) {
      console.error("AI analysis error:", err);

      setAnalysisError(
        err.response?.data?.message ||
          "Unable to analyze this content."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // ---------------------------------------------------------
  // FORMAT AI ANALYSIS VALUES
  // ---------------------------------------------------------

  const prettifyKey = (key) => {
    return String(key)
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
      .trim();
  };

  const renderAnalysisValue = (value) => {
    if (value === null || value === undefined) {
      return <span className="analysis-muted">Not available</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="analysis-muted">None</span>;
      }

      return (
        <div className="analysis-chip-list">
          {value.map((item, index) => (
            <span className="analysis-chip" key={index}>
              {typeof item === "object"
                ? JSON.stringify(item)
                : String(item)}
            </span>
          ))}
        </div>
      );
    }

    if (typeof value === "object") {
      return (
        <div className="analysis-nested">
          {Object.entries(value).map(([key, nestedValue]) => (
            <div className="analysis-nested-row" key={key}>
              <span>{prettifyKey(key)}</span>
              <strong>
                {typeof nestedValue === "object"
                  ? JSON.stringify(nestedValue)
                  : String(nestedValue)}
              </strong>
            </div>
          ))}
        </div>
      );
    }

    return String(value);
  };

  const renderAnalysis = () => {
    if (!analysisResult) {
      return null;
    }

    if (
      typeof analysisResult === "string" ||
      typeof analysisResult === "number"
    ) {
      return (
        <div className="analysis-text-result">
          {String(analysisResult)}
        </div>
      );
    }

    const entries = Object.entries(analysisResult);

    return (
      <div className="analysis-grid">
        {entries.map(([key, value]) => (
          <div className="analysis-item" key={key}>
            <div className="analysis-item-title">
              {prettifyKey(key)}
            </div>

            <div className="analysis-item-value">
              {renderAnalysisValue(value)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const wordCount = content.trim()
    ? content.trim().split(/\s+/).length
    : 0;

  return (
    <div className="posts-page-shell">
      {/* ------------------------------------------------ */}
      {/* SIDEBAR */}
      {/* ------------------------------------------------ */}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">P</div>

          <div>
            <strong>PulseAPI</strong>
            <span>EXP 5</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className="nav-item"
            onClick={onDashboard}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className="nav-item active"
            onClick={onPosts}
          >
            <span>▣</span>
            Posts
          </button>

          <button
            className="nav-item"
            onClick={onSchedules}
          >
            <span>◷</span>
            Schedules
          </button>

          <button
            className="nav-item"
            onClick={onAI}
          >
            <span>✦</span>
            AI Assistant
          </button>

          <button
            className="nav-item"
            onClick={onAnalytics}
          >
            <span>◇</span>
            Analytics
          </button>
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar">A</div>

          <div>
            <strong>admin@exp5.com</strong>
            <span>ADMIN</span>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------ */}
      {/* MAIN */}
      {/* ------------------------------------------------ */}

      <main className="main-content">
        <button
          className="back-button"
          onClick={onBack}
        >
          ← Dashboard
        </button>

        <div className="page-header">
          <div>
            <span className="eyebrow">CONTENT STUDIO</span>

            <h1>
              {editingId ? "Edit Post" : "Posts"}
            </h1>

            <p>
              Create, analyze and manage your social media
              content.
            </p>
          </div>

          <div className="role-badge">
            ADMIN
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="alert alert-error">
            <span>⚠</span>
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="alert alert-success">
            <span>✓</span>
            {success}
          </div>
        )}

        {/* ------------------------------------------------ */}
        {/* CREATE POST */}
        {/* ------------------------------------------------ */}

        <section className="content-card create-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">CREATE</span>

              <h2>
                {editingId
                  ? "Edit Post"
                  : "New Post"}
              </h2>
            </div>
          </div>

          <div className="form-grid">
            {/* PLATFORM */}

            <div className="form-group">
              <label>Platform</label>

              <select
                value={platform}
                onChange={(e) => {
                  setPlatform(e.target.value);
                  setAnalysisResult(null);
                }}
              >
                <option value="Twitter">
                  Twitter
                </option>

                <option value="Instagram">
                  Instagram
                </option>

                <option value="Facebook">
                  Facebook
                </option>
              </select>
            </div>

            {/* STATUS */}

            <div className="form-group">
              <label>Status</label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
              >
                <option value="DRAFT">
                  Draft
                </option>

                <option value="PUBLISHED">
                  Published
                </option>

                <option value="SCHEDULED">
                  Scheduled
                </option>
              </select>
            </div>

            {/* TONE */}

            <div className="form-group">
              <label>Content Tone</label>

              <select
                value={tone}
                onChange={(e) => {
                  setTone(e.target.value);
                  setAnalysisResult(null);
                }}
              >
                <option value="Professional">
                  Professional
                </option>

                <option value="Friendly">
                  Friendly
                </option>

                <option value="Educational">
                  Educational
                </option>

                <option value="Creative">
                  Creative
                </option>

                <option value="Inspirational">
                  Inspirational
                </option>
              </select>
            </div>
          </div>

          {/* ------------------------------------------------ */}
          {/* AI GENERATOR */}
          {/* ------------------------------------------------ */}

          <div className="ai-generator-box">
            <div className="ai-generator-header">
              <div>
                <span className="eyebrow">
                  ✦ OLLAMA AI
                </span>

                <h3>
                  Generate Content
                </h3>

                <p>
                  Create platform-ready content using
                  your local Llama 3.2 model.
                </p>
              </div>

              <span className="ai-status">
                ● Ollama
              </span>
            </div>

            {!showGenerator ? (
              <button
                className="secondary-button generator-open"
                onClick={() =>
                  setShowGenerator(true)
                }
              >
                ✦ Open Generator
              </button>
            ) : (
              <div className="generator-form">
                <div className="form-group">
                  <label>
                    Topic
                  </label>

                  <input
                    value={aiTopic}
                    onChange={(e) =>
                      setAiTopic(e.target.value)
                    }
                    placeholder="e.g. AI in Education"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Tone
                  </label>

                  <select
                    value={aiTone}
                    onChange={(e) =>
                      setAiTone(e.target.value)
                    }
                  >
                    <option>
                      Professional
                    </option>

                    <option>
                      Friendly
                    </option>

                    <option>
                      Educational
                    </option>

                    <option>
                      Creative
                    </option>

                    <option>
                      Inspirational
                    </option>
                  </select>
                </div>

                <div className="generator-actions">
                  <button
                    className="primary-button"
                    onClick={generatePost}
                    disabled={generating}
                  >
                    {generating
                      ? "Generating..."
                      : "✦ Generate Content"}
                  </button>

                  <button
                    className="secondary-button"
                    onClick={() =>
                      setShowGenerator(false)
                    }
                  >
                    Close
                  </button>
                </div>

                <small>
                  Powered by local Ollama · llama3.2
                </small>
              </div>
            )}
          </div>

          {/* ------------------------------------------------ */}
          {/* CONTENT */}
          {/* ------------------------------------------------ */}

          <div className="form-group content-group">
            <div className="content-label-row">
              <label>Content</label>

              <span
                className={
                  content.length > 280
                    ? "character-count danger"
                    : "character-count"
                }
              >
                {content.length} / 280
              </span>
            </div>

            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setAnalysisResult(null);
                setAnalysisError("");
              }}
              placeholder="Write your post..."
              rows={8}
            />

            <div className="content-meta">
              <span>
                {wordCount} words
              </span>

              <span>
                {platform} · {tone}
              </span>
            </div>
          </div>

          {/* ------------------------------------------------ */}
          {/* AI ANALYZER */}
          {/* ------------------------------------------------ */}

          <div className="ai-analyzer-box">
            <div className="analyzer-header">
              <div>
                <span className="eyebrow">
                  ✦ AI CONTENT ANALYZER
                </span>

                <h3>
                  Analyze your post before publishing
                </h3>

                <p>
                  Get AI-powered insights about your
                  content using Ollama.
                </p>
              </div>

              <div className="analyzer-icon">
                ✦
              </div>
            </div>

            <div className="analyzer-features">
              <span>🧠 Quality</span>
              <span>😊 Sentiment</span>
              <span>🎯 Engagement</span>
              <span>#️⃣ Suggestions</span>
            </div>

            <button
              className="analyze-button"
              onClick={analyzeContent}
              disabled={
                analyzing ||
                !content.trim()
              }
            >
              {analyzing
                ? "Analyzing with Ollama..."
                : "✦ Analyze Content"}
            </button>

            {analysisError && (
              <div className="analysis-error">
                ⚠ {analysisError}
              </div>
            )}

            {analysisResult && (
              <div className="analysis-result">
                <div className="analysis-result-header">
                  <div>
                    <span className="eyebrow">
                      AI ANALYSIS COMPLETE
                    </span>

                    <h3>
                      Content Insights
                    </h3>
                  </div>

                  <span className="analysis-success">
                    ✓ Analyzed
                  </span>
                </div>

                {renderAnalysis()}
              </div>
            )}
          </div>

          {/* ------------------------------------------------ */}
          {/* ACTIONS */}
          {/* ------------------------------------------------ */}

          <div className="form-footer">
            <div>
              {editingId && (
                <button
                  className="secondary-button"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <button
              className="primary-button"
              onClick={savePost}
              disabled={
                saving ||
                !content.trim() ||
                content.length > 280
              }
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Post"
                : "Create Post"}
            </button>
          </div>
        </section>

        {/* ------------------------------------------------ */}
        {/* RECENT POSTS */}
        {/* ------------------------------------------------ */}

        <section className="content-card recent-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                CONTENT LIBRARY
              </span>

              <h2>
                Recent Posts
              </h2>
            </div>

            <button
              className="secondary-button"
              onClick={loadPosts}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="empty-icon">
                ◌
              </div>

              <strong>
                Loading posts...
              </strong>
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                ◇
              </div>

              <strong>
                No posts found
              </strong>

              <p>
                Create your first social media post
                above.
              </p>
            </div>
          ) : (
            <div className="post-list">
              {posts.map((post) => (
                <div
                  className="post-row"
                  key={post.id}
                >
                  <div className="post-platform-icon">
                    {post.platform === "Instagram"
                      ? "◎"
                      : post.platform === "Facebook"
                      ? "f"
                      : "𝕏"}
                  </div>

                  <div className="post-info">
                    <strong>
                      {post.platform}
                    </strong>

                    <p>
                      {post.content}
                    </p>

                    <small>
                      {post.createdAt
                        ? new Date(
                            post.createdAt
                          ).toLocaleString()
                        : "Recently created"}
                    </small>
                  </div>

                  <span
                    className={`status-badge ${String(
                      post.status || "DRAFT"
                    ).toLowerCase()}`}
                  >
                    {post.status || "DRAFT"}
                  </span>

                  <div className="post-actions">
                    <button
                      className="edit-button"
                      onClick={() =>
                        startEditing(post)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        deletePost(post.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ------------------------------------------------ */}
      {/* PAGE-SPECIFIC STYLES */}
      {/* ------------------------------------------------ */}

      <style>{`
        /* =====================================================
           POSTS PAGE LAYOUT FIX
           Keeps the sidebar completely separate from the content.
           ===================================================== */

        .posts-page-shell {
          min-height: 100vh !important;
          width: 100% !important;
          min-width: 0 !important;
          background: #070b14 !important;
          color: #eef2f8 !important;
          overflow-x: hidden !important;
        }

        .posts-page-shell .sidebar {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          bottom: 0 !important;
          width: 220px !important;
          min-width: 220px !important;
          height: 100vh !important;
          box-sizing: border-box !important;
          z-index: 1000 !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }

        .posts-page-shell .main-content {
          position: relative !important;
          box-sizing: border-box !important;
          width: calc(100% - 220px) !important;
          min-width: 0 !important;
          margin-left: 220px !important;
          padding: 28px 34px 60px !important;
          overflow-x: hidden !important;
        }

        .posts-page-shell .page-header,
        .posts-page-shell .alert,
        .posts-page-shell .content-card {
          width: 100% !important;
          max-width: 1200px !important;
          box-sizing: border-box !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }

        .posts-page-shell .back-button {
          margin-bottom: 18px !important;
        }

        .posts-page-shell .create-card,
        .posts-page-shell .recent-card {
          overflow: hidden !important;
        }

        .main-content {
          min-width: 0;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .page-header h1 {
          margin: 5px 0 6px;
        }

        .page-header p {
          margin: 0;
        }

        .role-badge {
          border: 1px solid rgba(88, 101, 242, 0.45);
          background: rgba(88, 101, 242, 0.08);
          color: #8791ff;
          border-radius: 999px;
          padding: 7px 14px;
          font-size: 10px;
          font-weight: 800;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 16px;
          font-size: 13px;
        }

        .alert-error {
          border: 1px solid rgba(255, 90, 90, 0.35);
          background: rgba(255, 90, 90, 0.08);
          color: #ff8585;
        }

        .alert-success {
          border: 1px solid rgba(60, 220, 150, 0.35);
          background: rgba(60, 220, 150, 0.08);
          color: #63e6aa;
        }

        .create-card,
        .recent-card {
          margin-bottom: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-top: 22px;
        }

        .form-group {
          min-width: 0;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #aeb9d0;
          font-size: 11px;
          font-weight: 600;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          box-sizing: border-box;
        }

        .content-group {
          margin-top: 20px;
        }

        .content-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .content-label-row label {
          margin: 0;
        }

        .character-count {
          color: #7281a3;
          font-size: 10px;
        }

        .character-count.danger {
          color: #ff6f6f;
        }

        .content-meta {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          color: #6f7e9d;
          font-size: 10px;
        }

        /* AI GENERATOR */

        .ai-generator-box {
          margin-top: 20px;
          padding: 18px;
          border: 1px solid #26334e;
          border-radius: 14px;
          background: linear-gradient(
            135deg,
            rgba(24, 31, 60, 0.9),
            rgba(12, 18, 31, 0.9)
          );
        }

        .ai-generator-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
        }

        .ai-generator-header h3 {
          margin: 4px 0 5px;
          font-size: 15px;
        }

        .ai-generator-header p {
          margin: 0;
          color: #7484a4;
          font-size: 11px;
        }

        .ai-status {
          color: #8c98ff;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .generator-open {
          width: 100%;
          margin-top: 16px;
        }

        .generator-form {
          display: grid;
          gap: 12px;
          margin-top: 16px;
        }

        .generator-actions {
          display: flex;
          gap: 10px;
        }

        .generator-form small {
          text-align: center;
          color: #687796;
          font-size: 9px;
        }

        /* AI ANALYZER */

        .ai-analyzer-box {
          margin-top: 22px;
          padding: 20px;
          border: 1px solid rgba(88, 101, 242, 0.35);
          border-radius: 14px;
          background:
            radial-gradient(
              circle at top right,
              rgba(88, 101, 242, 0.12),
              transparent 45%
            ),
            #0c1220;
        }

        .analyzer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .analyzer-header h3 {
          margin: 4px 0 5px;
          font-size: 16px;
        }

        .analyzer-header p {
          margin: 0;
          color: #7583a0;
          font-size: 11px;
        }

        .analyzer-icon {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: rgba(88, 101, 242, 0.14);
          color: #8993ff;
          font-size: 18px;
          flex-shrink: 0;
        }

        .analyzer-features {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 16px 0;
        }

        .analyzer-features span {
          padding: 6px 9px;
          border: 1px solid #273452;
          border-radius: 999px;
          color: #9ba8c2;
          background: rgba(255,255,255,0.015);
          font-size: 10px;
        }

        .analyze-button {
          width: 100%;
          border: 0;
          border-radius: 9px;
          padding: 11px 16px;
          background: linear-gradient(
            135deg,
            #4855d9,
            #6875ff
          );
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        .analyze-button:hover:not(:disabled) {
          filter: brightness(1.08);
        }

        .analyze-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .analysis-error {
          margin-top: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          background: rgba(255, 90, 90, 0.08);
          border: 1px solid rgba(255, 90, 90, 0.3);
          color: #ff8d8d;
          font-size: 11px;
        }

        .analysis-result {
          margin-top: 18px;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #293653;
          background: rgba(8, 13, 24, 0.8);
        }

        .analysis-result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .analysis-result-header h3 {
          margin: 4px 0 0;
          font-size: 15px;
        }

        .analysis-success {
          color: #5de0a0;
          font-size: 10px;
          font-weight: 700;
        }

        .analysis-grid {
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 10px;
        }

        .analysis-item {
          padding: 13px;
          border: 1px solid #26334d;
          border-radius: 10px;
          background: #0d1422;
          min-width: 0;
        }

        .analysis-item-title {
          margin-bottom: 7px;
          color: #8190b1;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .analysis-item-value {
          color: #e8ecf5;
          font-size: 12px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .analysis-text-result {
          padding: 14px;
          border-radius: 10px;
          background: #0d1422;
          color: #dfe5f2;
          line-height: 1.7;
          font-size: 12px;
          white-space: pre-wrap;
        }

        .analysis-chip-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .analysis-chip {
          padding: 5px 8px;
          border-radius: 999px;
          background: rgba(88, 101, 242, 0.12);
          border: 1px solid rgba(88, 101, 242, 0.3);
          color: #aab2ff;
          font-size: 10px;
        }

        .analysis-muted {
          color: #697895;
        }

        .analysis-nested {
          display: grid;
          gap: 7px;
        }

        .analysis-nested-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding-bottom: 6px;
          border-bottom: 1px solid #202c42;
        }

        .analysis-nested-row span {
          color: #71809e;
        }

        .analysis-nested-row strong {
          color: #dce3f0;
          text-align: right;
          overflow-wrap: anywhere;
        }

        /* ACTIONS */

        .form-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-top: 20px;
        }

        .primary-button,
        .secondary-button,
        .edit-button,
        .delete-button {
          border-radius: 9px;
          cursor: pointer;
          font-weight: 700;
        }

        .primary-button {
          border: 0;
          padding: 11px 18px;
          background: linear-gradient(
            135deg,
            #4855d9,
            #6875ff
          );
          color: white;
        }

        .primary-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .secondary-button {
          padding: 10px 15px;
          border: 1px solid #2a3854;
          background: #0c1320;
          color: #aeb9d0;
        }

        .secondary-button:hover {
          border-color: #52628a;
          color: white;
        }

        /* POSTS */

        .post-list {
          width: 100%;
          min-width: 0;
          overflow: hidden;
        }

        .post-row {
          display: grid !important;
          grid-template-columns:
            42px
            minmax(0, 1fr)
            auto
            auto !important;
          align-items: start;
          gap: 14px;
          width: 100%;
          box-sizing: border-box;
          padding: 16px 0;
          border-bottom: 1px solid #1c2739;
        }

        .post-row:last-child {
          border-bottom: 0;
        }

        .post-platform-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: #151f38;
          color: #8d98ff;
          font-size: 17px;
          font-weight: 700;
        }

        .post-info {
          min-width: 0 !important;
          width: 100%;
          max-width: 100%;
          overflow: hidden;
        }

        .post-info strong {
          display: block;
          margin-bottom: 5px;
          color: #e9edf6;
          font-size: 12px;
        }

        .post-info p {
          width: 100%;
          max-width: 100%;
          margin: 0;
          color: #71809a;
          font-size: 11px;
          line-height: 1.6;
          white-space: normal !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
        }

        .post-info small {
          display: block;
          margin-top: 6px;
          color: #56637b;
          font-size: 9px;
        }

        .status-badge {
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 800;
          white-space: nowrap;
        }

        .status-badge.draft {
          background: rgba(88, 101, 242, 0.12);
          color: #8c98ff;
        }

        .status-badge.published {
          background: rgba(60, 220, 150, 0.1);
          color: #5de0a0;
        }

        .status-badge.scheduled {
          background: rgba(255, 190, 70, 0.1);
          color: #ffc96b;
        }

        .post-actions {
          display: flex !important;
          align-items: center;
          justify-content: flex-end;
          gap: 7px;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .edit-button,
        .delete-button {
          padding: 7px 10px;
          font-size: 9px;
        }

        .edit-button {
          border: 1px solid #2d3c5c;
          background: #10192b;
          color: #91a0c0;
        }

        .delete-button {
          border: 1px solid rgba(255, 90, 90, 0.25);
          background: rgba(255, 90, 90, 0.06);
          color: #ff7d7d;
        }

        .edit-button:hover {
          color: white;
          border-color: #52628a;
        }

        .delete-button:hover {
          background: rgba(255, 90, 90, 0.12);
        }

        .empty-state {
          min-height: 190px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          color: #7685a3;
          gap: 8px;
        }

        .empty-state strong {
          color: #dfe5f1;
          font-size: 13px;
        }

        .empty-state p {
          margin: 0;
          font-size: 11px;
        }

        .empty-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #151f38;
          color: #8793ff;
          margin-bottom: 4px;
        }

        @media (max-width: 900px) {
          .posts-page-shell .sidebar {
            width: 190px !important;
            min-width: 190px !important;
          }

          .posts-page-shell .main-content {
            width: calc(100% - 190px) !important;
            margin-left: 190px !important;
            padding: 24px 20px 50px !important;
          }
        }

        @media (max-width: 700px) {
          .posts-page-shell .sidebar {
            position: relative !important;
            width: 100% !important;
            min-width: 0 !important;
            height: auto !important;
            max-height: none !important;
          }

          .posts-page-shell .main-content {
            width: 100% !important;
            margin-left: 0 !important;
            padding: 22px 16px 40px !important;
          }
        }

        @media (max-width: 1000px) {
          .form-grid {
            grid-template-columns: 1fr 1fr;
          }

          .analysis-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .page-header {
            flex-direction: column;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .post-row {
            grid-template-columns:
              42px
              minmax(0, 1fr) !important;
          }

          .post-row .status-badge {
            grid-column: 2;
            justify-self: start;
          }

          .post-actions {
            grid-column: 2;
            justify-content: flex-start;
          }

          .analyzer-header {
            flex-direction: column;
          }

          .form-footer {
            flex-direction: column;
            align-items: stretch;
          }

          .form-footer .primary-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default PostsPage;