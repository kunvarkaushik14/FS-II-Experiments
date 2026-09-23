import { configureStore } from "@reduxjs/toolkit";
import postsReducer from "../features/posts/postsSlice";
import platformReducer from "../features/platforms/platformSlice";

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    platforms: platformReducer,
  },
});