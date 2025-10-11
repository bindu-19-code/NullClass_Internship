// src/pages/feed.tsx
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";

// Storage keys
const STORAGE_POSTS = "publicspace_posts_v1";
const STORAGE_USER = "publicspace_user_v1";

// Types
interface User {
  email: string;
  name: string;
  friendsCount: number;
}

interface Comment {
  id: string;
  authorEmail: string;
  authorName: string;
  text: string;
  createdAt: string;
}

interface Post {
  id: string;
  authorEmail: string;
  authorName: string;
  text: string;
  mediaUrl: string | null;
  mediaType: "image" | "video" | null;
  likes: string[];
  comments: Comment[];
  date: string;
  createdAt: string;
  shareCount: number;
}

// Utils
function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getAllowedPostsPerDay(friendsCount: number): number {
  if (friendsCount > 10) return Infinity;
  return Math.max(1, friendsCount);
}

function fmt(n: number) {
  return n > 999 ? (n / 1000).toFixed(1) + "k" : String(n);
}

export default function PublicSpace() {
  const { t } = useTranslation();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user + posts
  useEffect(() => {
    if (typeof window !== "undefined") {
      const rawUser = localStorage.getItem(STORAGE_USER);
      const rawPosts = localStorage.getItem(STORAGE_POSTS);

      if (rawUser) setUser(JSON.parse(rawUser));
      else {
        const defaultUser: User = { email: "you@gmail.com", name: t("publicSpace.you"), friendsCount: 0 };
        localStorage.setItem(STORAGE_USER, JSON.stringify(defaultUser));
        setUser(defaultUser);
      }

      if (rawPosts) setPosts(JSON.parse(rawPosts));
    }
  }, [t]);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (posts.length) localStorage.setItem(STORAGE_POSTS, JSON.stringify(posts));
  }, [posts]);

  // Handlers
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) {
      setError(t("publicSpace.errorMedia"));
      return;
    }
    setError("");
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  function postsMadeTodayCount() {
    return posts.filter((p) => p.date === todayKey() && p.authorEmail === user?.email).length;
  }

  function canPostNow() {
    if (!user) return false;
    const allowed = getAllowedPostsPerDay(user.friendsCount);
    return allowed === Infinity || postsMadeTodayCount() < allowed;
  }

  function resetInput() {
    setText("");
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function createPostObject({ text, file, previewUrl }: { text: string; file: File | null; previewUrl: string | null }): Post {
    if (!user) throw new Error(t("publicSpace.errorUserNotFound"));

    return {
      id: "post_" + Date.now(),
      authorEmail: user.email,
      authorName: user.name,
      text: text.trim(),
      mediaUrl: previewUrl || null,
      mediaType: file ? (file.type.split("/")[0] as "image" | "video") : null,
      likes: [],
      comments: [],
      date: todayKey(),
      createdAt: new Date().toISOString(),
      shareCount: 0,
    };
  }

  function handlePost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!canPostNow()) {
      const allowed = getAllowedPostsPerDay(user!.friendsCount);
      setError(t("publicSpace.errorPostLimit", { limit: allowed === Infinity ? t("publicSpace.multiple") : allowed }));
      return;
    }

    if (!text.trim() && !file) {
      setError(t("publicSpace.errorEmptyPost"));
      return;
    }

    const post = createPostObject({ text, file, previewUrl });
    setPosts((p) => [post, ...p]);
    resetInput();
  }

  function toggleLike(postId: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id !== postId
          ? p
          : {
              ...p,
              likes: p.likes.includes(user!.email)
                ? p.likes.filter((id) => id !== user!.email)
                : [...p.likes, user!.email],
            }
      )
    );
  }

  function addComment(postId: string, commentText: string) {
    if (!commentText.trim()) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id !== postId
          ? p
          : {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: `c_${Date.now()}`,
                  authorEmail: user!.email,
                  authorName: user!.name,
                  text: commentText.trim(),
                  createdAt: new Date().toISOString(),
                },
              ],
            }
      )
    );
  }

  function handleShare(postId: string) {
    const url = `${window.location.origin}${window.location.pathname}#${postId}`;
    navigator.clipboard?.writeText(url).then(
      () => {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, shareCount: (p.shareCount || 0) + 1 } : p))
        );
        alert(t("publicSpace.alertLinkCopied"));
      },
      () => alert(t("publicSpace.alertCopyFailed", { url }))
    );
  }

  function updateFriendsCount(v: string | number) {
    const n = Math.max(0, Math.floor(Number(v) || 0));
    setUser((u) => (u ? { ...u, friendsCount: n } : null));
  }

  if (!user) return <p>{t("publicSpace.loading")}</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 text-black">
      <header className="text-center">
        <h1 className="text-4xl font-bold mb-1">🌐 {t("publicSpace.title")}</h1>
        <p className="text-gray-700">{t("publicSpace.subtitle")}</p>
      </header>

      {/* Post Form */}
      <section className="p-4 border-2 border-blue-300 rounded-xl shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 space-y-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-semibold text-lg">{user.name}</div>
            <div className="text-gray-600">{t("publicSpace.friendsCount", { count: user.friendsCount })}</div>
          </div>
          <div className="text-gray-700">
            {t("publicSpace.allowedToday", { allowed: getAllowedPostsPerDay(user.friendsCount) === Infinity ? t("publicSpace.multiple") : getAllowedPostsPerDay(user.friendsCount) })}
          </div>
        </div>

        <form
          onSubmit={handlePost}
          className="space-y-3 p-4 border rounded-lg shadow-sm bg-white hover:shadow-xl transition-shadow duration-300"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("publicSpace.textareaPlaceholder")}
            rows={3}
            className="resize-none text-black w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />

          {previewUrl && (
            <div className="mt-2 rounded-lg overflow-hidden shadow-md">
              {file?.type.startsWith("image/") ? (
                <img src={previewUrl} alt="preview" className="w-full object-cover" />
              ) : (
                <video src={previewUrl} controls className="w-full rounded-lg" />
              )}
            </div>
          )}

          <div className="flex items-center gap-3 mt-2">
            <label className="cursor-pointer bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition">
              📎 {t("publicSpace.attach")}
              <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
            </label>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
              🚀 {t("publicSpace.post")}
            </button>
          </div>

          {error && <div className="text-sm text-red-600 font-medium">{error}</div>}

          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <div>
              {t("publicSpace.postsToday", { made: postsMadeTodayCount(), limit: getAllowedPostsPerDay(user.friendsCount) === Infinity ? "∞" : getAllowedPostsPerDay(user.friendsCount) })}
            </div>
            <div>{t("publicSpace.today")}: {todayKey()}</div>
          </div>

          {/* Friends Count */}
          <div className="mt-4 pt-3 border-t">
            <div className="p-4 border rounded-xl shadow-sm bg-gradient-to-r from-pink-50 to-pink-100 transition hover:shadow-lg">
              <label className="font-semibold text-gray-700">{t("publicSpace.simulateFriends")}</label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="number"
                  min={0}
                  value={user.friendsCount}
                  onChange={(e) => updateFriendsCount(e.target.value)}
                  className="w-24 text-black p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <span className="text-gray-600">{t("publicSpace.updateAllowance")}</span>
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* Feed */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">📰 {t("publicSpace.feed")}</h2>
        {posts.length === 0 && <div className="text-gray-500">{t("publicSpace.noPosts")}</div>}

        <div className="space-y-5">
          {posts.map((p) => (
            <article key={p.id} className="p-4 border rounded-xl shadow-sm bg-white hover:shadow-lg transition hover:-translate-y-1 duration-300">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 flex items-center justify-center bg-blue-300 text-white font-bold rounded-full text-lg">
                  {p.authorName?.[0]}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{p.authorName}</div>
                      <div className="text-gray-500 text-xs">{new Date(p.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-gray-400 text-xs">{p.date}</div>
                  </div>

                  {p.text && <p className="text-black mt-1">{p.text}</p>}

                  {p.mediaUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden shadow-md">
                      {p.mediaType === "image" ? (
                        <img src={p.mediaUrl} alt="media" className="w-full object-cover rounded-lg" />
                      ) : (
                        <video src={p.mediaUrl} controls className="w-full rounded-lg" />
                      )}
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <button onClick={() => toggleLike(p.id)} className="hover:scale-110 transition transform">
                      {p.likes.includes(user.email) ? t("publicSpace.unlike") : t("publicSpace.like")} <span>{fmt(p.likes.length)}</span>
                    </button>

                    <CommentBox post={p} onComment={(txt) => addComment(p.id, txt)} />

                    <button onClick={() => handleShare(p.id)} className="hover:scale-110 transition transform">
                      🔗 {t("publicSpace.share")} <span>{fmt(p.shareCount || 0)}</span>
                    </button>
                  </div>

                  {p.comments.length > 0 && (
                    <div className="mt-3 space-y-2 text-sm">
                      {p.comments.map((c) => (
                        <div key={c.id} className="bg-gray-50 p-2 rounded-lg">
                          <div className="font-medium text-xs text-gray-600">{c.authorName}</div>
                          <div className="text-black">{c.text}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

// CommentBox
interface CommentBoxProps {
  post: Post;
  onComment: (txt: string) => void;
}

function CommentBox({ post, onComment }: CommentBoxProps) {
  const { t } = useTranslation();
  const [val, setVal] = useState("");

  return (
    <div className="flex items-center gap-2">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={t("publicSpace.commentPlaceholder")}
        className="text-black p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-full"
      />
      <button
        onClick={() => {
          onComment(val);
          setVal("");
        }}
        className="text-black px-2 py-1 rounded-lg hover:bg-green-600 transition"
      >
        💬 {t("publicSpace.comment")}
      </button>
    </div>
  );
}
