export const mockUsers = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    role: "admin",
  },
  {
    id: 2,
    username: "editor",
    password: "editor123",
    role: "editor",
  },
  {
    id: 3,
    username: "viewer",
    password: "viewer123",
    role: "viewer",
  },
];

export const defaultPosts = [
  {
    id: 1,
    title: "Welcome to SocialHub",
    content:
      "Welcome to our secure social content platform.",
    image_url: "",
    author: "admin",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Getting Started",
    content:
      "Create, view and manage content according to your role.",
    image_url: "",
    author: "admin",
    createdAt: new Date().toISOString(),
  },
];