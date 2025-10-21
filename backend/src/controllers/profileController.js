import User from "../models/User.js";
import Post from "../models/Post.js";

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    // If no ID provided, get current user's profile
    const userId = req.params.id || req.user.id;
    
    const user = await User.findById(userId)
      .select("-password")  // hide password
      .populate("followers", "username avatar")
      .populate("following", "username avatar");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Posts by User
export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Follow User
export const followUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!targetUser) return res.status(404).json({ message: "User not found" });
    if (targetUser._id.toString() === req.user.id)
      return res.status(400).json({ message: "You can't follow yourself" });

    if (!targetUser.followers.includes(req.user.id)) {
      targetUser.followers.push(req.user.id);
      currentUser.following.push(targetUser._id);
    }

    await targetUser.save();
    await currentUser.save();

    res.json({ message: "Followed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unfollow User
export const unfollowUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    targetUser.followers.pull(req.user.id);
    currentUser.following.pull(targetUser._id);

    await targetUser.save();
    await currentUser.save();

    res.json({ message: "Unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    console.log('📝 Profile update request:', req.body);
    console.log('👤 User ID:', req.user.id);
    
    const { username, name, bio, location, website } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    console.log('👤 Current user:', { username: user.username, bio: user.bio, location: user.location });

    // Check if username is taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    // Update fields
    if (username) user.username = username;
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;

    await user.save();
    console.log('✅ Profile updated successfully');

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        bio: user.bio,
        location: user.location,
        website: user.website
      }
    });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({ error: error.message });
  }
};
