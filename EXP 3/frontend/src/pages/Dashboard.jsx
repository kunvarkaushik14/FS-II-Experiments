import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleDescription = () => {
    if (user.role === "admin") {
      return "Full access to create, view, edit and delete posts.";
    }

    if (user.role === "editor") {
      return "You can create, view and edit posts, but cannot delete them.";
    }

    return "You have view-only access to SocialHub posts.";
  };

  return (
    <div className="dashboard-page">

      {/* NAVBAR */}
      <nav className="dashboard-navbar">

        <div className="dashboard-brand">
          <div className="brand-icon">
            S
          </div>

          <div>
            <strong>SocialHub</strong>
            <small>Secure Content Management</small>
          </div>
        </div>

        <div className="dashboard-user">

          <div className="dashboard-avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>

          <div className="dashboard-user-info">
            <strong>{user.username}</strong>
            <span>{user.role}</span>
          </div>

          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>

        </div>

      </nav>


      {/* MAIN CONTENT */}
      <main className="dashboard-container">

        {/* WELCOME */}
        <div className="dashboard-welcome">

          <div>
            <div className="section-label">
              DASHBOARD
            </div>

            <h1>
              Welcome, {user.username} 👋
            </h1>

            <p>
              {getRoleDescription()}
            </p>
          </div>

          <div className={`role-display ${user.role}`}>
            {user.role.toUpperCase()}
          </div>

        </div>


        {/* PERMISSION CARDS */}
        <div className="dashboard-cards">

          {/* VIEW POSTS */}
          <div className="dashboard-card">

            <div className="dashboard-card-icon blue-bg">
              👁️
            </div>

            <h3>View Posts</h3>

            <p>
              Browse and explore all available
              SocialHub posts.
            </p>

            <button
              onClick={() => navigate("/posts")}
              className="card-button"
            >
              View Posts →
            </button>

          </div>


          {/* CREATE POSTS */}
          <div
            className={`dashboard-card ${
              user.role === "admin" ||
              user.role === "editor"
                ? ""
                : "locked-card"
            }`}
          >

            <div className="dashboard-card-icon purple-bg">
              ✨
            </div>

            <h3>Create Post</h3>

            <p>
              Create and publish new content
              on SocialHub.
            </p>

            {user.role === "admin" ||
            user.role === "editor" ? (

              <button
                onClick={() => navigate("/create-post")}
                className="card-button"
              >
                Create Post →
              </button>

            ) : (

              <button
                disabled
                className="card-button disabled-button"
              >
                🔒 Admin & Editor Only
              </button>

            )}

          </div>


          {/* EDIT POSTS */}
          <div
            className={`dashboard-card ${
              user.role === "admin" ||
              user.role === "editor"
                ? ""
                : "locked-card"
            }`}
          >

            <div className="dashboard-card-icon green-bg">
              ✏️
            </div>

            <h3>Edit Posts</h3>

            <p>
              Modify existing posts according
              to your permissions.
            </p>

            {user.role === "admin" ||
            user.role === "editor" ? (

              <button
                onClick={() => navigate("/posts")}
                className="card-button"
              >
                Edit Posts →
              </button>

            ) : (

              <button
                disabled
                className="card-button disabled-button"
              >
                🔒 Editor Access
              </button>

            )}

          </div>


          {/* DELETE POSTS */}
          <div
            className={`dashboard-card ${
              user.role === "admin"
                ? ""
                : "locked-card"
            }`}
          >

            <div className="dashboard-card-icon orange-bg">
              🗑️
            </div>

            <h3>Delete Posts</h3>

            <p>
              Permanently remove unwanted
              content from SocialHub.
            </p>

            {user.role === "admin" ? (

              <button
                onClick={() => navigate("/posts")}
                className="card-button delete-button"
              >
                Manage Posts →
              </button>

            ) : (

              <button
                disabled
                className="card-button disabled-button"
              >
                🔒 Admin Only
              </button>

            )}

          </div>

        </div>


        {/* PERMISSION SUMMARY */}
        <div className="permissions-panel">

          <div>

            <div className="section-label">
              YOUR PERMISSIONS
            </div>

            <h2>
              {user.role === "admin"
                ? "Administrator Access"
                : user.role === "editor"
                ? "Editor Access"
                : "Viewer Access"}
            </h2>

          </div>


          <div className="permission-summary">

            {/* VIEW */}
            <div>
              <span className="permission-check">
                ✓
              </span>
              View Posts
            </div>


            {/* EDIT */}
            {(user.role === "admin" ||
              user.role === "editor") && (

              <div>
                <span className="permission-check">
                  ✓
                </span>
                Edit Posts
              </div>

            )}


            {/* CREATE */}
            {(user.role === "admin" ||
              user.role === "editor") && (

              <div>
                <span className="permission-check">
                  ✓
                </span>
                Create Posts
              </div>

            )}


            {/* DELETE */}
            {user.role === "admin" ? (

              <div>
                <span className="permission-check">
                  ✓
                </span>
                Delete Posts
              </div>

            ) : (

              <div className="locked-text">
                🔒 Delete Posts
              </div>

            )}


            {/* MANAGE USERS */}
            {user.role === "admin" && (

              <div>
                <span className="permission-check">
                  ✓
                </span>
                Manage Users
              </div>

            )}

          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;