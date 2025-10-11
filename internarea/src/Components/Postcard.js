export default function PostCard({ post }) {
  return (
    <div style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
      <h3>{post.userId?.name}</h3>
      <p>{post.content}</p>
      {post.mediaUrl && (
        post.mediaUrl.endsWith(".mp4") ? (
          <video width="400" controls src={post.mediaUrl}></video>
        ) : (
          <img src={post.mediaUrl} alt="media" width="400" />
        )
      )}
      <div>
        <span>👍 {post.likes.length}</span> | 
        <span>💬 {post.comments.length}</span> | 
        <span>🔁 {post.shares.length}</span>
      </div>
    </div>
  );
}
