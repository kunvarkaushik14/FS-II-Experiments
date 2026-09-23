import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPost } from "../features/posts/postsSlice";

function AddPost() {
  const dispatch = useDispatch();

  const platforms = useSelector(
    (state) => state.platforms.platforms
  );

  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState(platforms[0]);

  const handleSubmit = () => {
    if (title.trim() === "") return;

    dispatch(
      addPost({
        id: Date.now(),
        title,
        platform,
      })
    );

    setTitle("");
  };

  return (
    <div className="card">
      <h2>Add Post</h2>

      <input
        type="text"
        placeholder="Enter Post"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <select
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
      >
        {platforms.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>

      <button onClick={handleSubmit}>Add Post</button>
    </div>
  );
}

export default AddPost;