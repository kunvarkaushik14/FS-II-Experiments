import { useState } from "react";
import api from "../services/api";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("admin@exp5.com");
  const [password, setPassword] = useState("admin123");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Login failed.");
      }

      const loginData = result.data;

      if (!loginData?.token) {
        throw new Error("Login succeeded but no JWT token was received.");
      }

      // Store JWT
      localStorage.setItem("token", loginData.token);

      // Store user information
      const user = {
        email: loginData.email || email.trim(),
        role: loginData.role || "VIEWER",
      };

      localStorage.setItem("user", JSON.stringify(user));

      // Send user to App
      onLogin(user);
    } catch (err) {
      console.error("Login error:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.data?.message ||
        err.message ||
        "Unable to sign in.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const useDemoAdmin = () => {
    setEmail("admin@exp5.com");
    setPassword("admin123");
    setError("");
  };

  return (
    <div className="login-page">

      {/* Background decoration */}
      <div className="login-glow login-glow-one"></div>
      <div className="login-glow login-glow-two"></div>

      <div className="login-card">

        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">
            P
          </div>

          <div>
            <strong>PulseAPI</strong>
            <span>EXP 5</span>
          </div>
        </div>

        {/* Header */}
        <div className="login-header">
          <span className="login-eyebrow">
            COMMAND CENTER
          </span>

          <h1>Welcome back</h1>

          <p>
            Sign in to manage your posts, schedules and AI workflow.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="login-error">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">

          <div className="login-field">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@exp5.com"
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        {/* Demo account */}
        <div className="demo-account">

          <div className="demo-header">
            <span>DEMO ACCOUNT</span>

            <span className="demo-role">
              ADMIN
            </span>
          </div>

          <div className="demo-details">
            <div>
              <small>Email</small>
              <strong>admin@exp5.com</strong>
            </div>

            <div>
              <small>Password</small>
              <strong>admin123</strong>
            </div>
          </div>

          <button
            type="button"
            className="demo-button"
            onClick={useDemoAdmin}
          >
            Use Demo Admin
          </button>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <span className="online-dot"></span>
          Local AI • Ollama + Llama 3.2
        </div>

      </div>
    </div>
  );
}

export default LoginPage;