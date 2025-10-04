import Post from "../models/Post.js";

// Create Post
export const createPost = async (req, res) => {
  try {
    const post = await Post.create({
      user: req.user.id,
      text: req.body.text,
      media: req.body.media || "",
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Feed with Pagination
export const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const posts = await Post.find()
      .populate("user", "username avatar")
      .populate("comments.user", "username avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Like / Unlike Post
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.includes(req.user.id);
    if (alreadyLiked) {
      post.likes.pull(req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json({ likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Comment
export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ user: req.user.id, text: req.body.text });
    await post.save();
    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Post (Author only)
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
