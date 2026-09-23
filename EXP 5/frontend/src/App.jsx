import { useEffect, useState } from "react";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import PostsPage from "./pages/PostsPage";
import SchedulesPage from "./pages/SchedulesPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import AnalyticsPage from "./pages/AnalyticsPage";

function App() {
  // =====================================================
  // RESTORE LOGIN FROM LOCAL STORAGE
  // =====================================================

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");

      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState("dashboard");

  // =====================================================
  // LOGOUT EVENT
  // Triggered automatically if JWT expires
  // =====================================================

  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setUser(null);
      setPage("dashboard");
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setPage("dashboard");
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setPage("dashboard");
  };

  // =====================================================
  // LOGIN SCREEN
  // =====================================================

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // =====================================================
  // POSTS
  // =====================================================

  if (page === "posts") {
    return (
      <PostsPage
        onBack={() => setPage("dashboard")}
        onDashboard={() => setPage("dashboard")}
        onPosts={() => setPage("posts")}
        onSchedules={() => setPage("schedules")}
        onAI={() => setPage("ai")}
        onAnalytics={() => setPage("analytics")}
      />
    );
  }

  // =====================================================
  // SCHEDULES
  // =====================================================

  if (page === "schedules") {
    return (
      <SchedulesPage
        onBack={() => setPage("dashboard")}
        onDashboard={() => setPage("dashboard")}
        onPosts={() => setPage("posts")}
        onSchedules={() => setPage("schedules")}
        onAI={() => setPage("ai")}
        onAnalytics={() => setPage("analytics")}
      />
    );
  }

  // =====================================================
  // AI ASSISTANT
  // =====================================================

  if (page === "ai") {
    return (
      <AIAssistantPage
        onBack={() => setPage("dashboard")}
      />
    );
  }

  // =====================================================
  // ANALYTICS
  // =====================================================

 if (page === "analytics") {
  return (
    <AnalyticsPage
      onBack={() => setPage("dashboard")}
      onDashboard={() => setPage("dashboard")}
      onPosts={() => setPage("posts")}
      onSchedules={() => setPage("schedules")}
      onAI={() => setPage("ai")}
      onAnalytics={() => setPage("analytics")}
    />
  );
}

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
      onPosts={() => setPage("posts")}
      onSchedules={() => setPage("schedules")}
      onAI={() => setPage("ai")}
      onAnalytics={() => setPage("analytics")}
    />
  );
}

export default App;