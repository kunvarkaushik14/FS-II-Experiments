import React from "react";
import AddPost from "./AddPost";
import Stats from "./Stats";
import PostList from "../features/posts/PostList";
import PlatformList from "../features/platforms/PlatformList";

function Dashboard() {
  return (
    <>
      <AddPost />
      <Stats />
      <PlatformList />
      <PostList />
    </>
  );
}

export default React.memo(Dashboard);