import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <div
          className="brand"
          onClick={() => navigate("/")}
        >
          <div className="brand-icon">S</div>

          <div>
            <div className="brand-name">
              SocialHub
            </div>

            <div className="brand-subtitle">
              JWT • RBAC Security
            </div>
          </div>
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#roles">Roles</a>
          <a href="#posts">Posts</a>

          <button
            className="nav-login"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>

      </nav>


      {/* ================= HERO ================= */}

      <section className="hero-section">

        <div className="hero-content">

          <div className="security-badge">
            <span>🔐</span>
            Secure JWT Authentication & RBAC
          </div>

          <h1>
            Connect.
            <span>Create.</span>
            Share.
          </h1>

          <p>
            A modern social content platform designed with
            secure authentication, role-based permissions,
            and powerful content management.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-button"
              onClick={() => navigate("/login")}
            >
              Get Started
              <span>→</span>
            </button>

            <button
              className="secondary-button"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

          </div>

          <div className="hero-features">

            <div>
              <span>✓</span>
              Secure Authentication
            </div>

            <div>
              <span>✓</span>
              Protected Routes
            </div>

            <div>
              <span>✓</span>
              Role-Based Access
            </div>

          </div>

        </div>


        {/* Hero visual */}

        <div className="hero-visual">

          <div className="floating-card card-one">
            <div className="floating-icon purple">
              🔐
            </div>

            <div>
              <strong>JWT Secure</strong>
              <small>Token Authentication</small>
            </div>
          </div>


          <div className="social-preview">

            <div className="preview-header">

              <div className="preview-user">

                <div className="avatar">
                  S
                </div>

                <div>
                  <strong>SocialHub</strong>
                  <small>@socialhub</small>
                </div>

              </div>

              <span className="verified">
                ✓
              </span>

            </div>


            <div className="preview-image">
              <div className="preview-gradient">
                Connect • Create • Share
              </div>
            </div>


            <div className="preview-actions">

              <span>♡</span>
              <span>💬</span>
              <span>↗</span>

            </div>


            <div className="preview-text">
              <strong>SocialHub</strong>{" "}
              Build. Share. Connect.
            </div>

          </div>


          <div className="floating-card card-two">

            <div className="floating-icon green">
              ✓
            </div>

            <div>
              <strong>Access Granted</strong>
              <small>Role: Admin</small>
            </div>

          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}

      <section
        id="features"
        className="features-section"
      >

        <div className="section-heading">

          <div className="section-label">
            WHY SOCIALHUB
          </div>

          <h2>
            Built for <span>secure sharing.</span>
          </h2>

          <p>
            Everything you need to manage content with
            authentication and role-based permissions.
          </p>

        </div>


        <div className="feature-grid">

          <div className="feature-card">

            <div className="feature-icon purple-bg">
              🔐
            </div>

            <h3>JWT Authentication</h3>

            <p>
              Secure token-based authentication keeps
              user sessions protected.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon blue-bg">
              🛡️
            </div>

            <h3>Protected Routes</h3>

            <p>
              Only authenticated users can access
              protected application pages.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon green-bg">
              👥
            </div>

            <h3>Role-Based Access</h3>

            <p>
              Admin, Editor and Viewer permissions
              provide controlled access.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon orange-bg">
              ⚡
            </div>

            <h3>Fast & Modern</h3>

            <p>
              Built using React, Vite, Express and
              MySQL for a modern experience.
            </p>

          </div>

        </div>

      </section>


      {/* ================= ROLES ================= */}

      <section
        id="roles"
        className="roles-section"
      >

        <div className="section-heading">

          <div className="section-label">
            ROLE MANAGEMENT
          </div>

          <h2>
            One platform.
            <span> Three roles.</span>
          </h2>

          <p>
            Every user gets exactly the permissions
            required for their role.
          </p>

        </div>


        <div className="role-grid">

          {/* ADMIN */}

          <div className="role-card admin-card">

            <div className="role-top">

              <div className="role-icon admin-icon">
                👑
              </div>

              <div className="role-badge admin-badge">
                FULL ACCESS
              </div>

            </div>

            <h3>Admin</h3>

            <p>
              Complete control over posts and
              application content.
            </p>

            <div className="permission-list">

              <div>
                <span>✓</span>
                Create posts
              </div>

              <div>
                <span>✓</span>
                View posts
              </div>

              <div>
                <span>✓</span>
                Edit posts
              </div>

              <div>
                <span>✓</span>
                Delete posts
              </div>

              <div>
                <span>✓</span>
                Manage users
              </div>

            </div>

          </div>


          {/* EDITOR */}

          <div className="role-card editor-card">

            <div className="role-top">

              <div className="role-icon editor-icon">
                ✏️
              </div>

              <div className="role-badge editor-badge">
                EDIT ACCESS
              </div>

            </div>

            <h3>Editor</h3>

            <p>
              Can create, view and edit existing
content, but cannot delete posts.
            </p>

            <div className="permission-list">

              <div>
                <span>✓</span>
                View posts
              </div>

              <div>
                <span>✓</span>
                Edit posts
              </div>

              <div className="disabled-permission">
                <span>🔒</span>
                Create posts
              </div>

              <div className="disabled-permission">
                <span>🔒</span>
                Delete posts
              </div>

              <div className="disabled-permission">
                <span>🔒</span>
                Manage users
              </div>

            </div>

          </div>


          {/* VIEWER */}

          <div className="role-card viewer-card">

            <div className="role-top">

              <div className="role-icon viewer-icon">
                👁️
              </div>

              <div className="role-badge viewer-badge">
                VIEW ONLY
              </div>

            </div>

            <h3>Viewer</h3>

            <p>
              Can explore and read posts without
              modifying application content.
            </p>

            <div className="permission-list">

              <div>
                <span>✓</span>
                View posts
              </div>

              <div>
  <span>✓</span>
  Create posts
</div>

              <div className="disabled-permission">
                <span>🔒</span>
                Edit posts
              </div>

              <div className="disabled-permission">
                <span>🔒</span>
                Delete posts
              </div>

              <div className="disabled-permission">
                <span>🔒</span>
                Manage users
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= POSTS ================= */}

      <section
        id="posts"
        className="posts-section"
      >

        <div className="posts-container">

          <div className="posts-heading">

            <div>
              <div className="section-label">
                SOCIAL FEED
              </div>

              <h2>
                Discover the latest posts
              </h2>
            </div>

            <button
              className="view-all-button"
              onClick={() => navigate("/login")}
            >
              Explore Feed →
            </button>

          </div>


          <div className="post-grid">

            <div className="post-card">

              <div className="post-image post-purple">
                <span>CREATE</span>
              </div>

              <div className="post-body">

                <div className="post-author">
                  <div className="small-avatar">
                    A
                  </div>

                  <div>
                    <strong>Admin</strong>
                    <small>2 hours ago</small>
                  </div>
                </div>

                <h3>
                  Building something amazing
                </h3>

                <p>
                  Create and share your ideas with
                  SocialHub.
                </p>

              </div>

            </div>


            <div className="post-card">

              <div className="post-image post-blue">
                <span>SHARE</span>
              </div>

              <div className="post-body">

                <div className="post-author">

                  <div className="small-avatar blue-avatar">
                    E
                  </div>

                  <div>
                    <strong>Editor</strong>
                    <small>5 hours ago</small>
                  </div>

                </div>

                <h3>
                  Content that connects
                </h3>

                <p>
                  Edit and improve content while
                  keeping everything secure.
                </p>

              </div>

            </div>


            <div className="post-card">

              <div className="post-image post-green">
                <span>CONNECT</span>
              </div>

              <div className="post-body">

                <div className="post-author">

                  <div className="small-avatar green-avatar">
                    V
                  </div>

                  <div>
                    <strong>Viewer</strong>
                    <small>Yesterday</small>
                  </div>

                </div>

                <h3>
                  Explore the community
                </h3>

                <p>
                  View the latest content from
                  your community.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}

      <section className="cta-section">

        <div className="cta-box">

          <div className="cta-glow"></div>

          <div className="section-label">
            GET STARTED TODAY
          </div>

          <h2>
            Your content.
            <span> Your permissions.</span>
          </h2>

          <p>
            Experience secure social content
            management with SocialHub.
          </p>

          <button
            className="primary-button"
            onClick={() => navigate("/login")}
          >
            Enter SocialHub
            <span>→</span>
          </button>

        </div>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="footer">

        <div className="footer-brand">

          <div className="brand-icon">
            S
          </div>

          <div>
            <strong>SocialHub</strong>
            <small>
              Secure social content management
            </small>
          </div>

        </div>

        <p>
          JWT Authentication • RBAC • React • Express • MySQL
        </p>

        <p>
          © 2026 SocialHub. Built for secure sharing.
        </p>

      </footer>

    </div>
  );
}

export default LandingPage;