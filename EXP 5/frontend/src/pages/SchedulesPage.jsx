import { useEffect, useState } from "react";
import api from "../services/api";

function SchedulesPage({
  onBack,
  onDashboard,
  onPosts,
  onSchedules,
  onAI,
  onAnalytics,
}) {
  const [schedules, setSchedules] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("Twitter");
  const [status, setStatus] = useState("SCHEDULED");
  const [scheduledAt, setScheduledAt] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // AI generator
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("Professional");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/schedules");

      const data = response.data?.data;

      if (Array.isArray(data)) {
        setSchedules(data);
      } else {
        setSchedules([]);
      }
    } catch (err) {
      console.error("Load schedules error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load schedules."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPlatform("Twitter");
    setStatus("SCHEDULED");
    setScheduledAt("");

    setEditingId(null);

    setAiTopic("");
    setAiTone("Professional");

    setError("");
  };

  const getMinDateTime = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const startEditing = (schedule) => {
    setEditingId(schedule.id);

    setTitle(schedule.title || "");
    setDescription(schedule.description || "");
    setPlatform(schedule.platform || "Twitter");
    setStatus(schedule.status || "SCHEDULED");

    if (schedule.scheduledAt) {
      setScheduledAt(
        String(schedule.scheduledAt).slice(0, 16)
      );
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const saveSchedule = async () => {
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Schedule title is required.");
      return;
    }

    if (!description.trim()) {
      setError("Description/content is required.");
      return;
    }

    if (!scheduledAt) {
      setError("Please select a scheduled date and time.");
      return;
    }

    const selectedDate = new Date(scheduledAt);
    const now = new Date();

    if (selectedDate <= now) {
      setError(
        "Scheduled date and time must be in the future."
      );
      return;
    }

    try {
      setSaving(true);

      const scheduleData = {
        title: title.trim(),
        description: description.trim(),
        scheduledAt,
        status,
        platform,
      };

      if (editingId) {
        await api.put(
          `/schedules/${editingId}`,
          scheduleData
        );

        setSuccess(
          "Schedule updated successfully."
        );
      } else {
        await api.post(
          "/schedules",
          scheduleData
        );

        setSuccess(
          "Schedule created successfully."
        );
      }

      await loadSchedules();

      resetForm();

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Save schedule error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save schedule."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteSchedule = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this schedule?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(`/schedules/${id}`);

      setSchedules((current) =>
        current.filter(
          (schedule) => schedule.id !== id
        )
      );

      setSuccess(
        "Schedule deleted successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Delete schedule error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete schedule."
      );
    }
  };

  // ----------------------------------------------------
  // OLLAMA AI GENERATOR
  // ----------------------------------------------------

  const generateScheduleContent = async () => {
    if (!aiTopic.trim()) {
      setError(
        "Enter a topic for AI content generation."
      );
      return;
    }

    try {
      setGenerating(true);
      setError("");

      const response = await api.post(
        "/ai/generate-post",
        {
          topic: aiTopic.trim(),
          platform,
          tone: aiTone,
        }
      );

      const generatedContent =
        response.data?.data?.content ||
        response.data?.content ||
        "";

      if (!generatedContent) {
        throw new Error(
          "No generated content received."
        );
      }

      setDescription(generatedContent);

      setSuccess(
        "AI generated content added to your schedule."
      );

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error(
        "AI schedule generator error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to generate content."
      );
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return "No date";
    }

    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  return (
    <div className="schedule-page-root">

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <aside className="sidebar schedule-sidebar">

        <div className="brand">
          <div className="brand-logo">
            P
          </div>

          <div className="brand-text">
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
            className="nav-item"
            onClick={onPosts}
          >
            <span>▣</span>
            Posts
          </button>

          <button
            className="nav-item active"
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

          <div className="sidebar-avatar">
            A
          </div>

          <div>
            <strong>
              admin@exp5.com
            </strong>

            <span>
              ADMIN
            </span>
          </div>

        </div>

      </aside>


      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <main className="schedule-main">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Dashboard
        </button>


        {/* HEADER */}

        <div className="schedule-header">

          <div>

            <span className="eyebrow">
              AUTOMATION
            </span>

            <h1>
              Schedules
            </h1>

            <p>
              Plan, generate and manage your scheduled
              social content.
            </p>

          </div>

          <div className="role-badge">
            ADMIN
          </div>

        </div>


        {/* ERROR */}

        {error && (
          <div className="schedule-alert schedule-error">
            <span>⚠</span>
            {error}
          </div>
        )}


        {/* SUCCESS */}

        {success && (
          <div className="schedule-alert schedule-success">
            <span>✓</span>
            {success}
          </div>
        )}


        {/* ================================================= */}
        {/* BALANCED TWO COLUMN LAYOUT */}
        {/* ================================================= */}

        <div className="schedule-layout">


          {/* ================================================= */}
          {/* LEFT — CREATE */}
          {/* ================================================= */}

          <section className="schedule-form-card">

            <div className="card-title">

              <span className="eyebrow">
                {editingId
                  ? "EDIT"
                  : "CREATE"}
              </span>

              <h2>
                {editingId
                  ? "Edit Schedule"
                  : "New Schedule"}
              </h2>

            </div>


            {/* TITLE */}

            <div className="schedule-field">

              <label>
                Schedule Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="e.g. Morning Twitter Post"
              />

            </div>


            {/* AI GENERATOR */}

            <div className="schedule-ai-box">

              <div className="schedule-ai-header">

                <div>

                  <span className="eyebrow">
                    AI SCHEDULER
                  </span>

                  <h3>
                    ✦ Generate Content
                  </h3>

                </div>

                <span className="ollama-dot">
                  • Ollama
                </span>

              </div>


              <div className="schedule-ai-fields">

                <div className="schedule-field">

                  <label>
                    Topic
                  </label>

                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) =>
                      setAiTopic(e.target.value)
                    }
                    placeholder="e.g. AI in Education"
                  />

                </div>


                <div className="schedule-field">

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


                <button
                  className="ai-generate-button"
                  onClick={
                    generateScheduleContent
                  }
                  disabled={generating}
                >
                  {generating
                    ? "Generating..."
                    : "✦ Generate Content"}
                </button>


                <small className="ai-powered">
                  Powered by local Ollama · llama3.2
                </small>

              </div>

            </div>


            {/* DESCRIPTION */}

            <div className="schedule-field">

              <label>
                Description / Content
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Describe the scheduled content or generate it with AI..."
                rows={7}
              />

            </div>


            {/* PLATFORM */}

            <div className="schedule-field">

              <label>
                Platform
              </label>

              <select
                value={platform}
                onChange={(e) =>
                  setPlatform(e.target.value)
                }
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


            {/* DATE */}

            <div className="schedule-field">

              <label>
                Scheduled Date & Time
              </label>

              <input
                type="datetime-local"
                value={scheduledAt}
                min={getMinDateTime()}
                onChange={(e) =>
                  setScheduledAt(
                    e.target.value
                  )
                }
              />

            </div>


            {/* STATUS */}

            <div className="schedule-field">

              <label>
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
              >

                <option value="SCHEDULED">
                  Scheduled
                </option>

                <option value="DRAFT">
                  Draft
                </option>

                <option value="PUBLISHED">
                  Published
                </option>

              </select>

            </div>


            {/* ACTIONS */}

            <div className="schedule-form-actions">

              {editingId && (
                <button
                  className="schedule-secondary-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}

              <button
                className="schedule-primary-button"
                onClick={saveSchedule}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Schedule"
                  : "Create Schedule"}
              </button>

            </div>

          </section>


          {/* ================================================= */}
          {/* RIGHT — SCHEDULED CONTENT */}
          {/* ================================================= */}

          <section className="schedule-list-card">

            <div className="schedule-list-header">

              <div>

                <span className="eyebrow">
                  CALENDAR
                </span>

                <h2>
                  Scheduled Content
                </h2>

              </div>

              <button
                className="schedule-secondary-button"
                onClick={loadSchedules}
                disabled={loading}
              >
                ↻ Refresh
              </button>

            </div>


            {loading ? (

              <div className="schedule-empty">

                <div className="schedule-empty-icon">
                  ◌
                </div>

                <strong>
                  Loading schedules...
                </strong>

              </div>

            ) : schedules.length === 0 ? (

              <div className="schedule-empty">

                <div className="schedule-empty-icon">
                  ◷
                </div>

                <strong>
                  No schedules found
                </strong>

                <p>
                  Create your first scheduled post.
                </p>

              </div>

            ) : (

              <div className="schedule-items">

                {schedules.map((schedule) => (

                  <div
                    className={`schedule-item ${
                      editingId === schedule.id
                        ? "schedule-item-editing"
                        : ""
                    }`}
                    key={schedule.id}
                  >

                    <div className="schedule-item-icon">
                      ◷
                    </div>


                    <div className="schedule-item-content">

                      <div className="schedule-item-top">

                        <div>

                          <strong>
                            {schedule.title}
                          </strong>

                          <span className="schedule-platform">
                            {schedule.platform}
                          </span>

                        </div>


                        <span
                          className={`schedule-status ${String(
                            schedule.status ||
                              "SCHEDULED"
                          ).toLowerCase()}`}
                        >
                          {schedule.status ||
                            "SCHEDULED"}
                        </span>

                      </div>


                      <p>
                        {schedule.description}
                      </p>


                      <small>
                        🕒{" "}
                        {formatDate(
                          schedule.scheduledAt
                        )}
                      </small>


                      <div className="schedule-item-actions">

                        <button
                          className="schedule-edit-button"
                          onClick={() =>
                            startEditing(
                              schedule
                            )
                          }
                        >
                          Edit
                        </button>


                        <button
                          className="schedule-delete-button"
                          onClick={() =>
                            deleteSchedule(
                              schedule.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

        </div>

      </main>


      {/* ================================================= */}
      {/* PAGE STYLES */}
      {/* ================================================= */}

      <style>{`

        /* ================================================= */
        /* GLOBAL PAGE SHELL                                  */
        /* ================================================= */

        .schedule-page-root {
          width: 100%;
          min-width: 0;
          min-height: 100vh;

          box-sizing: border-box;

          overflow-x: hidden;

          background: #070a11;
        }


        /* ================================================= */
        /* SIDEBAR                                            */
        /* ================================================= */

        .schedule-page-root .schedule-sidebar {
          position: fixed !important;

          top: 0;
          left: 0;
          bottom: 0;

          width: 216px !important;
          min-width: 216px !important;

          height: 100vh;

          z-index: 1000;

          overflow-y: auto;
          overflow-x: hidden;

          box-sizing: border-box;

          background: #0a0f18;

          border-right: 1px solid #1d2738;

          padding: 24px 16px;

          display: flex;
          flex-direction: column;
        }


        /* ================================================= */
        /* BRAND                                              */
        /* ================================================= */

        .schedule-sidebar .brand {
          display: flex;
          align-items: center;
          gap: 11px;

          padding: 0 4px;

          margin-bottom: 34px;
        }


        .schedule-sidebar .brand-logo {
          width: 34px;
          height: 34px;

          flex-shrink: 0;

          display: grid;
          place-items: center;

          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              #4d5be8,
              #7180ff
            );

          color: white;

          font-size: 15px;
          font-weight: 900;

          box-shadow:
            0 8px 20px
            rgba(79, 91, 220, 0.25);
        }


        .schedule-sidebar .brand-text {
          display: flex;
          flex-direction: column;

          min-width: 0;
        }


        .schedule-sidebar .brand-text strong {
          color: #f3f5fb;

          font-size: 14px;
          font-weight: 800;

          line-height: 1.2;
        }


        .schedule-sidebar .brand-text span {
          margin-top: 3px;

          color: #667594;

          font-size: 9px;
          font-weight: 600;
        }


        /* ================================================= */
        /* NAVIGATION                                         */
        /* ================================================= */

        .schedule-sidebar .sidebar-nav {
          display: flex;
          flex-direction: column;

          gap: 7px;

          width: 100%;
        }


        .schedule-sidebar .nav-item {
          width: 100%;

          display: flex;
          align-items: center;

          gap: 12px;

          padding: 12px 12px;

          border: 1px solid transparent;

          border-radius: 10px;

          background: transparent;

          color: #7f8da8;

          font-size: 11px;
          font-weight: 700;

          text-align: left;

          cursor: pointer;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease;
        }


        .schedule-sidebar .nav-item span {
          width: 17px;

          display: inline-flex;
          justify-content: center;

          color: #8190ae;

          font-size: 13px;
        }


        .schedule-sidebar .nav-item:hover {
          background: #101827;

          color: #dfe5f4;
        }


        .schedule-sidebar .nav-item.active {
          background: #171f32;

          border-color: #202d46;

          color: #ffffff;

          box-shadow:
            inset 3px 0 0 #5865f2;
        }


        .schedule-sidebar .nav-item.active span {
          color: #8d98ff;
        }


        /* ================================================= */
        /* SIDEBAR USER                                       */
        /* ================================================= */

        .schedule-sidebar .sidebar-user {
          margin-top: auto;

          padding-top: 18px;

          border-top: 1px solid #1b2638;

          display: flex;
          align-items: center;

          gap: 10px;

          min-width: 0;
        }


        .schedule-sidebar .sidebar-avatar {
          width: 34px;
          height: 34px;

          flex-shrink: 0;

          display: grid;
          place-items: center;

          border-radius: 10px;

          background: #1a2438;

          border: 1px solid #293754;

          color: #9ca8ff;

          font-size: 12px;
          font-weight: 800;
        }


        .schedule-sidebar .sidebar-user > div:last-child {
          min-width: 0;

          display: flex;
          flex-direction: column;
        }


        .schedule-sidebar .sidebar-user strong {
          color: #e7ebf5;

          font-size: 10px;

          overflow: hidden;

          white-space: nowrap;

          text-overflow: ellipsis;
        }


        .schedule-sidebar .sidebar-user span {
          margin-top: 4px;

          color: #6d7b96;

          font-size: 8px;

          font-weight: 800;

          letter-spacing: 0.7px;
        }


        /* ================================================= */
        /* MAIN                                                */
        /* ================================================= */

        .schedule-page-root .schedule-main {
          width: calc(100% - 216px) !important;

          max-width: none !important;

          min-width: 0;

          margin-left: 216px !important;

          margin-right: 0;

          box-sizing: border-box;

          padding:
            28px
            32px
            60px;
        }


        /* ================================================= */
        /* BACK BUTTON                                        */
        /* ================================================= */

        .schedule-main .back-button {
          display: inline-flex;
          align-items: center;

          margin-bottom: 18px;

          padding: 8px 12px;

          border: 1px solid #263650;

          border-radius: 8px;

          background: #0c1320;

          color: #91a0bd;

          font-size: 9px;
          font-weight: 700;

          cursor: pointer;

          transition: 0.2s ease;
        }


        .schedule-main .back-button:hover {
          border-color: #5865f2;

          color: white;

          background: #121a2b;
        }


        /* ================================================= */
        /* HEADER                                             */
        /* ================================================= */

        .schedule-header {
          width: 100%;
          max-width: 100%;

          min-width: 0;

          box-sizing: border-box;

          display: flex;

          justify-content: space-between;
          align-items: flex-start;

          gap: 20px;

          margin-bottom: 22px;
        }


        .schedule-header > div:first-child {
          min-width: 0;
        }


        .schedule-header h1 {
          margin: 6px 0 6px;

          color: #f4f6fb;

          font-size: 34px;
          line-height: 1.05;

          font-weight: 850;

          letter-spacing: -1px;
        }


        .schedule-header p {
          margin: 0;

          color: #72819e;

          font-size: 12px;
          line-height: 1.6;
        }


        .role-badge {
          flex-shrink: 0;

          border: 1px solid
            rgba(88, 101, 242, 0.45);

          background:
            rgba(88, 101, 242, 0.08);

          color: #8994ff;

          border-radius: 999px;

          padding: 7px 14px;

          font-size: 9px;
          font-weight: 800;
        }


        /* ================================================= */
        /* EYEBROW                                            */
        /* ================================================= */

        .schedule-main .eyebrow {
          display: block;

          color: #7486d9;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 1.4px;
        }


        /* ================================================= */
        /* ALERTS                                             */
        /* ================================================= */

        .schedule-alert {
          width: 100%;

          box-sizing: border-box;

          display: flex;

          align-items: center;

          gap: 9px;

          padding: 12px 15px;

          border-radius: 9px;

          margin-bottom: 16px;

          font-size: 11px;
        }


        .schedule-error {
          border: 1px solid
            rgba(255, 90, 90, 0.35);

          background:
            rgba(255, 90, 90, 0.08);

          color: #ff8585;
        }


        .schedule-success {
          border: 1px solid
            rgba(70, 220, 150, 0.35);

          background:
            rgba(70, 220, 150, 0.08);

          color: #65e3a6;
        }


        /* ================================================= */
        /* TWO COLUMN LAYOUT                                  */
        /* ================================================= */

        .schedule-layout {
          width: 100%;

          min-width: 0;

          display: grid;

          grid-template-columns:
            minmax(350px, 410px)
            minmax(0, 1fr);

          align-items: start;

          gap: 20px;

          box-sizing: border-box;
        }


        .schedule-layout > * {
          min-width: 0;

          max-width: 100%;
        }


        /* ================================================= */
        /* LEFT CARD                                          */
        /* ================================================= */

        .schedule-form-card {
          width: 100%;

          min-width: 0;
          max-width: 100%;

          box-sizing: border-box;

          padding: 24px;

          border: 1px solid #25324b;

          border-radius: 16px;

          background: #0c111c;

          overflow: hidden;
        }


        .card-title {
          margin-bottom: 22px;
        }


        .card-title h2 {
          margin: 5px 0 0;

          color: #e9edf5;

          font-size: 18px;
        }


        /* ================================================= */
        /* FORM FIELDS                                        */
        /* ================================================= */

        .schedule-field {
          width: 100%;

          min-width: 0;

          margin-bottom: 17px;
        }


        .schedule-field label {
          display: block;

          margin-bottom: 8px;

          color: #aab6cf;

          font-size: 10px;

          font-weight: 600;
        }


        .schedule-field input,
        .schedule-field select,
        .schedule-field textarea {
          display: block;

          width: 100%;

          max-width: 100%;

          min-width: 0;

          box-sizing: border-box;

          border: 1px solid #263650;

          border-radius: 9px;

          background: #080d16;

          color: #e5e9f2;

          padding: 11px 12px;

          outline: none;

          font-family: inherit;

          font-size: 11px;
        }


        .schedule-field input,
        .schedule-field select {
          height: 40px;
        }


        .schedule-field textarea {
          min-height: 150px;

          resize: vertical;

          line-height: 1.6;
        }


        .schedule-field input::placeholder,
        .schedule-field textarea::placeholder {
          color: #53627e;
        }


        .schedule-field input:focus,
        .schedule-field select:focus,
        .schedule-field textarea:focus {
          border-color: #5865f2;

          box-shadow:
            0 0 0 3px
            rgba(88, 101, 242, 0.08);
        }


        /* ================================================= */
        /* AI GENERATOR                                       */
        /* ================================================= */

        .schedule-ai-box {
          width: 100%;

          min-width: 0;

          box-sizing: border-box;

          margin-bottom: 19px;

          padding: 17px;

          border: 1px solid #2b3757;

          border-radius: 14px;

          background:
            linear-gradient(
              135deg,
              rgba(26, 33, 65, 0.9),
              rgba(11, 17, 29, 0.95)
            );
        }


        .schedule-ai-header {
          display: flex;

          justify-content: space-between;

          align-items: flex-start;

          gap: 10px;

          margin-bottom: 15px;
        }


        .schedule-ai-header h3 {
          margin: 4px 0 0;

          color: #edf0f8;

          font-size: 14px;
        }


        .ollama-dot {
          color: #8793ff;

          font-size: 9px;

          font-weight: 700;

          white-space: nowrap;
        }


        .schedule-ai-fields {
          display: grid;

          gap: 11px;
        }


        .schedule-ai-fields .schedule-field {
          margin-bottom: 0;
        }


        .ai-generate-button {
          width: 100%;

          border: 0;

          border-radius: 9px;

          padding: 11px;

          background:
            linear-gradient(
              135deg,
              #414dcc,
              #626eff
            );

          color: white;

          font-size: 10px;

          font-weight: 700;

          cursor: pointer;

          transition: 0.2s ease;
        }


        .ai-generate-button:hover:not(:disabled) {
          filter: brightness(1.08);

          transform: translateY(-1px);
        }


        .ai-generate-button:disabled {
          opacity: 0.5;

          cursor: not-allowed;
        }


        .ai-powered {
          display: block;

          text-align: center;

          color: #667592;

          font-size: 8px;
        }


        /* ================================================= */
        /* FORM BUTTONS                                       */
        /* ================================================= */

        .schedule-form-actions {
          display: flex;

          justify-content: flex-end;

          gap: 9px;

          margin-top: 5px;
        }


        .schedule-primary-button,
        .schedule-secondary-button,
        .schedule-edit-button,
        .schedule-delete-button {
          border-radius: 8px;

          cursor: pointer;

          font-family: inherit;

          font-weight: 700;

          transition: 0.2s ease;
        }


        .schedule-primary-button {
          border: 0;

          padding: 11px 17px;

          background:
            linear-gradient(
              135deg,
              #4b57dc,
              #6975ff
            );

          color: white;

          font-size: 10px;
        }


        .schedule-primary-button:hover:not(:disabled) {
          filter: brightness(1.08);

          transform: translateY(-1px);
        }


        .schedule-primary-button:disabled {
          opacity: 0.45;

          cursor: not-allowed;
        }


        .schedule-secondary-button {
          border: 1px solid #2a3853;

          background: #0d1421;

          color: #9daac3;

          padding: 9px 13px;

          font-size: 9px;
        }


        .schedule-secondary-button:hover {
          border-color: #526388;

          color: white;

          background: #111a2a;
        }


        /* ================================================= */
        /* RIGHT CARD                                         */
        /* ================================================= */

        .schedule-list-card {
          width: 100%;

          min-width: 0;

          max-width: 100%;

          min-height: 480px;

          box-sizing: border-box;

          padding: 24px;

          border: 1px solid #25324b;

          border-radius: 16px;

          background: #0c111c;

          overflow: hidden;
        }


        .schedule-list-header {
          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          gap: 15px;

          margin-bottom: 20px;
        }


        .schedule-list-header h2 {
          margin: 5px 0 0;

          color: #e9edf5;

          font-size: 18px;
        }


        /* ================================================= */
        /* EMPTY STATE                                        */
        /* ================================================= */

        .schedule-empty {
          min-height: 380px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          color: #7483a1;
        }


        .schedule-empty-icon {
          width: 48px;
          height: 48px;

          display: grid;

          place-items: center;

          margin-bottom: 13px;

          border-radius: 13px;

          background: #151f38;

          color: #8290ff;

          font-size: 19px;

          box-shadow:
            0 8px 25px
            rgba(10, 15, 30, 0.25);
        }


        .schedule-empty strong {
          color: #e0e5f0;

          font-size: 13px;
        }


        .schedule-empty p {
          margin: 7px 0 0;

          color: #667592;

          font-size: 10px;
        }


        /* ================================================= */
        /* SCHEDULE ITEMS                                     */
        /* ================================================= */

        .schedule-items {
          display: grid;

          gap: 10px;

          width: 100%;

          min-width: 0;
        }


        .schedule-item {
          display: grid;

          grid-template-columns:
            42px
            minmax(0, 1fr);

          gap: 13px;

          width: 100%;

          min-width: 0;

          box-sizing: border-box;

          padding: 15px;

          border: 1px solid #202d45;

          border-radius: 12px;

          background: #0e1523;

          transition: 0.2s ease;
        }


        .schedule-item:hover {
          border-color: #344566;

          background: #101929;
        }


        .schedule-item-editing {
          border-color: #5865f2 !important;

          background: #121a2d !important;
        }


        .schedule-item-icon {
          width: 42px;
          height: 42px;

          display: grid;

          place-items: center;

          border-radius: 11px;

          background: #17213a;

          color: #8490ff;

          font-size: 16px;
        }


        .schedule-item-content {
          min-width: 0;

          width: 100%;

          overflow: hidden;
        }


        .schedule-item-top {
          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          gap: 12px;

          min-width: 0;
        }


        .schedule-item-top > div {
          min-width: 0;
        }


        .schedule-item-top strong {
          display: block;

          color: #e9edf5;

          font-size: 12px;

          overflow-wrap: anywhere;
        }


        .schedule-platform {
          display: inline-block;

          margin-top: 5px;

          color: #7887a5;

          font-size: 9px;
        }


        .schedule-item-content p {
          margin: 9px 0 7px;

          color: #7887a3;

          font-size: 10px;

          line-height: 1.6;

          overflow-wrap: anywhere;

          word-break: break-word;
        }


        .schedule-item-content small {
          color: #65738f;

          font-size: 9px;
        }


        .schedule-status {
          flex-shrink: 0;

          padding: 5px 8px;

          border-radius: 999px;

          font-size: 8px;

          font-weight: 800;

          white-space: nowrap;
        }


        .schedule-status.scheduled {
          background:
            rgba(255, 190, 70, 0.1);

          color: #ffc96b;
        }


        .schedule-status.draft {
          background:
            rgba(88, 101, 242, 0.12);

          color: #929dff;
        }


        .schedule-status.published {
          background:
            rgba(60, 220, 150, 0.1);

          color: #62e3a5;
        }


        .schedule-item-actions {
          display: flex;

          gap: 7px;

          margin-top: 11px;
        }


        .schedule-edit-button,
        .schedule-delete-button {
          padding: 6px 10px;

          font-size: 9px;
        }


        .schedule-edit-button {
          border: 1px solid #2d3b58;

          background: #111a2b;

          color: #91a0bf;
        }


        .schedule-edit-button:hover {
          border-color: #5865f2;

          color: #c6ccff;
        }


        .schedule-delete-button {
          border: 1px solid
            rgba(255, 90, 90, 0.25);

          background:
            rgba(255, 90, 90, 0.05);

          color: #ff7d7d;
        }


        .schedule-delete-button:hover {
          background:
            rgba(255, 90, 90, 0.1);

          border-color:
            rgba(255, 90, 90, 0.45);
        }


        /* ================================================= */
        /* RESPONSIVE                                         */
        /* ================================================= */

        @media (max-width: 1100px) {

          .schedule-page-root .schedule-sidebar {
            width: 200px !important;

            min-width: 200px !important;
          }


          .schedule-page-root .schedule-main {
            width: calc(100% - 200px) !important;

            margin-left: 200px !important;

            padding:
              24px
              24px
              50px;
          }


          .schedule-layout {
            grid-template-columns:
              minmax(300px, 360px)
              minmax(0, 1fr);
          }

        }


        @media (max-width: 850px) {

          .schedule-page-root .schedule-sidebar {
            width: 180px !important;

            min-width: 180px !important;
          }


          .schedule-page-root .schedule-main {
            width: calc(100% - 180px) !important;

            margin-left: 180px !important;

            padding:
              22px
              20px
              45px;
          }


          .schedule-layout {
            grid-template-columns: 1fr;
          }


          .schedule-list-card {
            min-height: 350px;
          }

        }


        @media (max-width: 650px) {

          .schedule-page-root .schedule-sidebar {
            position: relative !important;

            width: 100% !important;

            min-width: 100% !important;

            height: auto;

            max-height: none;
          }


          .schedule-page-root .schedule-main {
            width: 100% !important;

            margin-left: 0 !important;

            padding:
              20px
              15px
              40px;
          }


          .schedule-header {
            flex-direction: column;
          }


          .schedule-form-card,
          .schedule-list-card {
            padding: 17px;
          }


          .schedule-item-top {
            flex-direction: column;

            gap: 7px;
          }


          .schedule-status {
            align-self: flex-start;
          }


          .schedule-form-actions {
            flex-direction: column;
          }


          .schedule-primary-button,
          .schedule-secondary-button {
            width: 100%;
          }

        }

      `}</style>

    </div>
  );
}

export default SchedulesPage;