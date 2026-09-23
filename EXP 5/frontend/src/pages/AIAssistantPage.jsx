import { useState } from "react";
import api from "../services/api";

function AIAssistantPage({ onBack }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const askAssistant = async (event) => {
    event.preventDefault();

    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnswer("");

      const response = await api.post("/rag/ask", {
        question: question.trim(),
      });

      setAnswer(response.data.data?.answer || "No answer received.");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to get a response from the AI Assistant."
      );
    } finally {
      setLoading(false);
    }
  };

  const exampleQuestions = [
    "What is the purpose of REST APIs in EXP 5?",
    "What validation is used in EXP 5?",
    "What is RAG?",
    "How does Ollama work in this project?",
  ];

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="brand-icon">PX</div>

          <div>
            <strong>EXP 5</strong>
            <span>Command Center</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <button
            className="nav-item"
            onClick={onBack}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button className="nav-item">
            <span>◈</span>
            Posts
          </button>

          <button className="nav-item">
            <span>◷</span>
            Schedules
          </button>

          <button className="nav-item active">
            <span>✦</span>
            AI Assistant
          </button>

        </nav>

      </aside>

      {/* MAIN */}
      <main className="dashboard-main">

        <header className="topbar">

          <div>
            <p className="eyebrow">
              OLLAMA + RAG
            </p>

            <h1>AI Assistant</h1>

            <p className="page-description">
              Ask questions about your EXP 5 knowledge base.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={onBack}
          >
            ← Dashboard
          </button>

        </header>

        <section className="ai-assistant-container">

          {/* HERO */}
          <div className="ai-hero">

            <div className="ai-large-icon">
              ✦
            </div>

            <div>
              <p className="card-label">
                LOCAL AI KNOWLEDGE ASSISTANT
              </p>

              <h2>
                Ask anything about EXP 5
              </h2>

              <p>
                Your question is converted into an embedding,
                relevant knowledge is retrieved, and Ollama
                generates the contextual answer.
              </p>
            </div>

          </div>

          {/* QUESTION BOX */}
          <div className="content-card ai-question-card">

            <form onSubmit={askAssistant}>

              <label>
                Your Question
              </label>

              <textarea
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                placeholder="Ask something about REST APIs, validation, RAG, Ollama..."
                rows="5"
              />

              <div className="ai-form-footer">

                <span>
                  Powered by local Ollama
                </span>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading}
                >
                  {loading
                    ? "Thinking..."
                    : "Ask Assistant →"}
                </button>

              </div>

            </form>

          </div>

          {/* ERROR */}
          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          {/* ANSWER */}
          {answer && (
            <div className="content-card ai-answer-card">

              <div className="card-header">

                <div>
                  <p className="card-label">
                    AI RESPONSE
                  </p>

                  <h2>
                    Answer
                  </h2>
                </div>

                <div className="ai-online">
                  ● Ollama
                </div>

              </div>

              <div className="ai-answer">
                {answer}
              </div>

            </div>
          )}

          {/* EXAMPLES */}
          <div className="content-card">

            <div className="card-header">

              <div>
                <p className="card-label">
                  TRY ASKING
                </p>

                <h2>
                  Example Questions
                </h2>
              </div>

            </div>

            <div className="example-question-grid">

              {exampleQuestions.map((item) => (
                <button
                  key={item}
                  className="example-question"
                  onClick={() => setQuestion(item)}
                >
                  <span>✦</span>
                  {item}
                </button>
              ))}

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AIAssistantPage;