import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { defaultPosts } from "../data/mockData";

function Posts() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);

  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  // =====================================
  // LOAD POSTS
  // =====================================

  useEffect(() => {
    const savedPosts =
      JSON.parse(localStorage.getItem("posts")) || [];

    if (savedPosts.length === 0) {
      localStorage.setItem(
        "posts",
        JSON.stringify(defaultPosts)
      );

      setPosts(defaultPosts);
    } else {
      setPosts(savedPosts);
    }
  }, []);

  // =====================================
  // LOGOUT
  // =====================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // =====================================
  // DELETE POST
  // ADMIN ONLY
  // =====================================

  const handleDelete = (id) => {
    if (user?.role !== "admin") {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) {
      return;
    }

    const updatedPosts = posts.filter(
      (post) => post.id !== id
    );

    setPosts(updatedPosts);

    localStorage.setItem(
      "posts",
      JSON.stringify(updatedPosts)
    );
  };

  // =====================================
  // OPEN EDIT
  // ADMIN + EDITOR
  // =====================================

  const handleEdit = (post) => {
    if (
      user?.role !== "admin" &&
      user?.role !== "editor"
    ) {
      return;
    }

    setEditingPost(post);

    setEditTitle(post.title);
    setEditContent(post.content);
    setEditImageUrl(post.image_url || "");
  };

  // =====================================
  // SAVE EDIT
  // ADMIN + EDITOR
  // =====================================

  const handleUpdate = (e) => {
    e.preventDefault();

    if (
      user?.role !== "admin" &&
      user?.role !== "editor"
    ) {
      return;
    }

    if (
      !editTitle.trim() ||
      !editContent.trim()
    ) {
      alert("Title and content are required.");
      return;
    }

    const updatedPosts = posts.map((post) => {
      if (post.id === editingPost.id) {
        return {
          ...post,

          title: editTitle.trim(),

          content: editContent.trim(),

          image_url: editImageUrl.trim(),

          updatedAt:
            new Date().toISOString(),
        };
      }

      return post;
    });

    setPosts(updatedPosts);

    localStorage.setItem(
      "posts",
      JSON.stringify(updatedPosts)
    );

    setEditingPost(null);
  };

  // =====================================
  // FORMAT DATE
  // =====================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="posts-page">

      {/* =================================
          NAVBAR
      ================================= */}

      <nav className="posts-navbar">

        <button
          className="posts-logo"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <span className="posts-logo-icon">
            S
          </span>

          <span>
            SocialHub
          </span>
        </button>


        <div className="posts-nav-right">

          <div className="posts-user">

            <div className="posts-avatar">
              {user?.username
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div>

              <strong>
                {user?.username}
              </strong>

              <span>
                {user?.role}
              </span>

            </div>

          </div>


          <button
            className="posts-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>


      {/* =================================
          MAIN CONTENT
      ================================= */}

      <main className="posts-container">

        {/* HEADER */}

        <div className="posts-header">

          <div>

            <div className="section-label">
              SOCIAL FEED
            </div>

            <h1>
              Explore Posts
            </h1>

            <p>
              Discover and manage SocialHub
              content.
            </p>

          </div>


          {/* CREATE BUTTON */}

          {(user?.role === "admin" ||
            user?.role === "editor") && (

            <button
              className="create-post-top-button"
              onClick={() =>
                navigate("/create-post")
              }
            >
              + Create Post
            </button>

          )}

        </div>


        {/* =================================
            POSTS
        ================================= */}

        {posts.length === 0 ? (

          <div className="empty-posts">

            <div className="empty-post-icon">
              📝
            </div>

            <h2>
              No posts yet
            </h2>

            <p>
              Be the first person to create
              something on SocialHub.
            </p>

            {(user?.role === "admin" ||
              user?.role === "editor") && (

              <button
                className="create-post-top-button"
                onClick={() =>
                  navigate("/create-post")
                }
              >
                Create First Post →
              </button>

            )}

          </div>

        ) : (

          <div className="posts-grid">

            {posts.map((post) => (

              <article
                className="post-card"
                key={post.id}
              >

                {/* IMAGE */}

                {post.image_url ? (

                  <div className="post-image-wrapper">

                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="post-image"
                    />

                  </div>

                ) : (

                  <div className="post-placeholder">
                    <span>✨</span>
                  </div>

                )}


                {/* POST CONTENT */}

                <div className="post-card-content">

                  {/* AUTHOR */}

                  <div className="post-author">

                    <div className="post-author-avatar">
                      {post.author
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>

                      <strong>
                        {post.author}
                      </strong>

                      <span>
                        {post.authorRole}
                        {" • "}
                        {formatDate(
                          post.createdAt
                        )}
                      </span>

                    </div>

                  </div>


                  {/* TITLE */}

                  <h2>
                    {post.title}
                  </h2>


                  {/* CONTENT */}

                  <p>
                    {post.content}
                  </p>


                  {/* ACTIONS */}

                  <div className="post-actions">

                    {/* EDIT */}

                    {(user?.role === "admin" ||
                      user?.role === "editor") ? (

                      <button
                        className="edit-post-button"
                        onClick={() =>
                          handleEdit(post)
                        }
                      >
                        ✏️ Edit
                      </button>

                    ) : (

                      <button
                        className="disabled-post-button"
                        disabled
                      >
                        🔒 Edit
                      </button>

                    )}


                    {/* DELETE */}

                    {user?.role === "admin" ? (

                      <button
                        className="delete-post-button"
                        onClick={() =>
                          handleDelete(post.id)
                        }
                      >
                        🗑️ Delete
                      </button>

                    ) : (

                      <button
                        className="disabled-post-button"
                        disabled
                      >
                        🔒 Delete
                      </button>

                    )}

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}


        {/* =================================
            PERMISSION INFORMATION
        ================================= */}

        <div className="posts-permission-bar">

          <div>

            <span>
              🔐
            </span>

            <strong>
              {user?.role?.toUpperCase()}
              {" "}ACCESS
            </strong>

          </div>


          <div className="posts-permissions">

            <span>
              ✓ View
            </span>

            {(user?.role === "admin" ||
              user?.role === "editor") && (
              <>
                <span>
                  ✓ Create
                </span>

                <span>
                  ✓ Edit
                </span>
              </>
            )}

            {user?.role === "admin" ? (

              <span>
                ✓ Delete
              </span>

            ) : (

              <span className="locked-permission">
                🔒 Delete
              </span>

            )}

          </div>

        </div>

      </main>


      {/* =================================
          EDIT MODAL
      ================================= */}

      {editingPost && (

        <div className="edit-modal-overlay">

          <div className="edit-modal">

            <div className="edit-modal-header">

              <div>

                <div className="section-label">
                  EDIT POST
                </div>

                <h2>
                  Update Your Post
                </h2>

              </div>

              <button
                className="close-modal"
                onClick={() =>
                  setEditingPost(null)
                }
              >
                ×
              </button>

            </div>


            <form
              onSubmit={handleUpdate}
              className="edit-form"
            >

              <div className="form-group">

                <label>
                  Post Title
                </label>

                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) =>
                    setEditTitle(
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="form-group">

                <label>
                  Content
                </label>

                <textarea
                  rows={7}
                  value={editContent}
                  onChange={(e) =>
                    setEditContent(
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="form-group">

                <label>
                  Image URL
                </label>

                <input
                  type="url"
                  value={editImageUrl}
                  onChange={(e) =>
                    setEditImageUrl(
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="edit-modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setEditingPost(null)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="publish-button"
                >
                  Save Changes →
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Posts;