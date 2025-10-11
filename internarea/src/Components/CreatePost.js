import { useState } from "react";
import axios from "axios";

export default function CreatePost({ onPost }) {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  const handlePost = async () => {
    try {
      const res = await axios.post("https://nullclass-internship-1gk4.onrender.com/api/posts", {
        userId: "USER_ID_HERE", // replace with logged-in user id
        content,
        mediaUrl
      });
      onPost(res.data);
      setContent("");
      setMediaUrl("");
    } catch (err) {
      alert(err.response.data.error || "Error posting");
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input
        type="text"
        placeholder="Media URL (optional)"
        value={mediaUrl}
        onChange={(e) => setMediaUrl(e.target.value)}
      />
      <button onClick={handlePost}>Post</button>
    </div>
  );
}
