import { useState, useEffect } from "react";
import "./App.css";
import PostComposer from "./components/PostComposer";
import DraftManager from "./components/DraftManager";

function App() {
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("drafts")) || [];
    setDrafts(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("drafts", JSON.stringify(drafts));
  }, [drafts]);

  return (
    <div className="container">
      <h1>Social Media Post Composer</h1>

      <PostComposer drafts={drafts} setDrafts={setDrafts} />

      <DraftManager drafts={drafts} setDrafts={setDrafts} />
    </div>
  );
}

export default App;