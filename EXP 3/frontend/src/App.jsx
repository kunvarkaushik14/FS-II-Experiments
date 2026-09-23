import Posts from "./pages/Posts";
import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreatePost from "./pages/CreatePost";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* PUBLIC */}

      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/login"
        element={<Login />}
      />


      {/* DASHBOARD */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
<Route
  path="/posts"
  element={
    <ProtectedRoute>
      <Posts />
    </ProtectedRoute>
  }
/>

      {/* CREATE POST
          ADMIN + EDITOR ONLY */}

      <Route
        path="/create-post"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "editor"]}
          >
            <CreatePost />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;