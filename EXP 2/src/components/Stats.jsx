import { useSelector } from "react-redux";
import {
  totalPosts,
  instagramPosts,
  twitterPosts,
  facebookPosts,
  linkedinPosts,
} from "../features/posts/postSelectors";

function Stats() {
  const total = useSelector(totalPosts);
  const instagram = useSelector(instagramPosts);
  const twitter = useSelector(twitterPosts);
  const facebook = useSelector(facebookPosts);
  const linkedin = useSelector(linkedinPosts);

  return (
    <div className="card">
      <h2>Statistics</h2>

      <p>Total Posts: {total}</p>
      <p>Instagram Posts: {instagram.length}</p>
      <p>Twitter Posts: {twitter.length}</p>
      <p>Facebook Posts: {facebook.length}</p>
      <p>LinkedIn Posts: {linkedin.length}</p>
    </div>
  );
}

export default Stats;