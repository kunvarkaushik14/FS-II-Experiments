import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function CreatePost() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // Check required fields
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    // Only Admin and Editor can create posts
    if (
      user?.role !== "admin" &&
      user?.role !== "editor"
    ) {
      setError(
        "You do not have permission to create posts."
      );
      return;
    }

    try {
      setLoading(true);

      // Get existing posts
      const savedPosts =
        JSON.parse(
          localStorage.getItem("posts")
        ) || [];

      // Create new post
      const newPost = {
        id: Date.now(),

        title: title.trim(),

        content: content.trim(),

        image_url: imageUrl.trim(),

        author: user.username,

        authorRole: user.role,

        createdAt:
          new Date().toISOString(),
      };

      // Add new post
      const updatedPosts = [
        newPost,
        ...savedPosts,
      ];

      // Save posts
      localStorage.setItem(
        "posts",
        JSON.stringify(updatedPosts)
      );

      setMessage(
        "Post created successfully! 🎉"
      );

      // Clear form
      setTitle("");
      setContent("");
      setImageUrl("");

      // Go to posts page
      setTimeout(() => {
        navigate("/posts");
      }, 1000);

    } catch (err) {
      console.error(err);

      setError(
        "Unable to save post. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-page">

      {/* NAVBAR */}

      <nav className="create-post-navbar">

        <button
          className="back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Dashboard
        </button>

        <div className="create-post-brand">

          <strong>
            SocialHub
          </strong>

          <span>
            Create Content
          </span>

        </div>

        <div className="create-post-role">
          {user?.role?.toUpperCase()}
        </div>

      </nav>


      {/* MAIN CONTENT */}

      <main className="create-post-container">

        <div className="create-post-header">

          <div className="section-label">
            NEW POST
          </div>

          <h1>
            Create Something New
          </h1>

          <p>
            Share your thoughts, ideas and
            content with the SocialHub
            community.
          </p>

        </div>


        {/* FORM */}

        <form
          className="create-post-form"
          onSubmit={handleSubmit}
        >

          {/* TITLE */}

          <div className="form-group">

            <label htmlFor="title">
              Post Title
            </label>

            <input
              id="title"
              type="text"
              placeholder="Enter your post title..."
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              maxLength={150}
            />

          </div>


          {/* CONTENT */}

          <div className="form-group">

            <label htmlFor="content">
              Content
            </label>

            <textarea
              id="content"
              placeholder="Write your post here..."
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              rows={9}
            />

          </div>


          {/* IMAGE URL */}

          <div className="form-group">

            <label htmlFor="imageUrl">

              Image URL

              <span>
                Optional
              </span>

            </label>

            <input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) =>
                setImageUrl(e.target.value)
              }
            />

          </div>


          {/* ERROR */}

          {error && (
            <div className="form-error">
              ⚠️ {error}
            </div>
          )}


          {/* SUCCESS */}

          {message && (
            <div className="form-success">
              ✓ {message}
            </div>
          )}


          {/* BUTTONS */}

          <div className="create-post-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="publish-button"
              disabled={loading}
            >
              {loading
                ? "Publishing..."
                : "Publish Post →"}
            </button>

          </div>

        </form>


        {/* SECURITY INFORMATION */}

        <div className="create-post-security">

          <div className="security-icon">
            🔐
          </div>

          <div>

            <strong>
              Role-based publishing
            </strong>

            <p>
              Only Admin and Editor accounts
              can create posts. Posts are stored
              locally for this frontend-only
              demonstration.
            </p>

          </div>

        </div>

      </main>

    </div>
  );
}

export default CreatePost;