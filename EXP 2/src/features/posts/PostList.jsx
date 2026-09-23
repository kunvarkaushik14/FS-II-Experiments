import { useDispatch, useSelector } from "react-redux";
import { deletePost } from "./postsSlice";

function PostList() {
  const dispatch = useDispatch();

  const posts = useSelector((state) => state.posts.posts);

  return (
    <div className="card">
      <h2>Posts</h2>

      {posts.map((post) => (
        <div key={post.id}>
          <h3>{post.title}</h3>

          <p>{post.platform}</p>

          <button onClick={() => dispatch(deletePost(post.id))}>
            Delete
          </button>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default PostList;