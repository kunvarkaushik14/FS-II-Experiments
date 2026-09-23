import { useState } from "react";
import PlatformSelector from "./PlatformSelector";

const limits = {
  Twitter: 280,
  LinkedIn: 3000,
  Instagram: 2200,
};

function PostComposer({ drafts, setDrafts }) {
  const [platform, setPlatform] = useState("Twitter");
  const [text, setText] = useState("");

  const limit = limits[platform];

  const saveDraft = () => {
    if (text.trim() === "") {
      alert("Please enter a post.");
      return;
    }

    if (text.length > limit) {
      alert("Character limit exceeded!");
      return;
    }

    const draft = {
      id: Date.now(),
      platform,
      text,
    };

    setDrafts([...drafts, draft]);

    alert("Draft Saved Successfully!");

    setText("");
  };

  return (
    <div className="box">
      <h2>Create Post</h2>

      <PlatformSelector
        platform={platform}
        setPlatform={setPlatform}
      />

      <textarea
        rows="6"
        placeholder="Write your post..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <p>
        Characters : {text.length}/{limit}
      </p>

      {text.length > limit && (
        <p className="error">
          Character limit exceeded!
        </p>
      )}

      <button
        onClick={saveDraft}
        disabled={text.length > limit}
      >
        Save Draft
      </button>
    </div>
  );
}

export default PostComposer;