import { createSelector } from "@reduxjs/toolkit";

const selectPosts = (state) => state.posts.posts;

export const totalPosts = createSelector(
  [selectPosts],
  (posts) => posts.length
);

export const instagramPosts = createSelector(
  [selectPosts],
  (posts) => posts.filter(post => post.platform === "Instagram")
);

export const twitterPosts = createSelector(
  [selectPosts],
  (posts) => posts.filter(post => post.platform === "Twitter")
);

export const facebookPosts = createSelector(
  [selectPosts],
  (posts) => posts.filter(post => post.platform === "Facebook")
);

export const linkedinPosts = createSelector(
  [selectPosts],
  (posts) => posts.filter(post => post.platform === "LinkedIn")
);