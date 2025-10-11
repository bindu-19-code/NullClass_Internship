const express = require("express");
const router = express.Router();
const Post = require("../Model/Post");

// Create post
router.post("/", async (req, res) => {
  try {
    const { userEmail, caption, media } = req.body;

    if (!userEmail) return res.status(400).json({ message: "Email is required" });

    const newPost = new Post({
      userEmail,
      caption,
      media,
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like post
router.post("/:id/like", async (req, res) => {
  try {
    const { userEmail } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.likes.includes(userEmail)) {
      post.likes = post.likes.filter((email) => email !== userEmail);
    } else {
      post.likes.push(userEmail);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Comment post
router.post("/:id/comment", async (req, res) => {
  try {
    const { user, text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ user, text });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
