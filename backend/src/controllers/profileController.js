import User from "../models/User.js";
import Post from "../models/Post.js";
import { createNotification } from "../utils/notifications.js";

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
      
      // Create follow notification
      await createNotification(req.io, req.onlineUsers, {
        recipient: targetUser._id,
        sender: req.user.id,
        type: "follow",
        message: "started following you"
      });
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

// Search Users
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user.id;
    
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } }
      ]
    })
    .select('username name bio avatar followers following')
    .limit(20);

    // Add follow status for each user
    const usersWithFollowStatus = users.map(user => ({
      ...user.toObject(),
      isFollowing: user.followers.includes(currentUserId),
      followersCount: user.followers.length,
      followingCount: user.following.length
    }));

    res.json(usersWithFollowStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Suggested Users
export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUser = await User.findById(currentUserId);
    
    // Get users not followed by current user
    const suggestedUsers = await User.find({
      _id: { 
        $ne: currentUserId,
        $nin: currentUser.following
      }
    })
    .select('username name bio avatar followers following')
    .limit(10)
    .sort({ createdAt: -1 });

    const usersWithCounts = suggestedUsers.map(user => ({
      ...user.toObject(),
      followersCount: user.followers.length,
      followingCount: user.following.length
    }));

    res.json(usersWithCounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Followers
export const getFollowers = async (req, res) => {
  try {
    const userId = req.params.id === 'me' ? req.user.id : req.params.id;
    const currentUserId = req.user.id;
    
    const user = await User.findById(userId)
      .populate('followers', 'username name bio avatar followers following')
      .select('followers');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const followersWithCounts = user.followers.map(follower => ({
      ...follower.toObject(),
      followersCount: follower.followers?.length || 0,
      followingCount: follower.following?.length || 0,
      isFollowing: follower.followers?.includes(currentUserId) || false
    }));
    
    res.json(followersWithCounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Following
export const getFollowing = async (req, res) => {
  try {
    const userId = req.params.id === 'me' ? req.user.id : req.params.id;
    const currentUserId = req.user.id;
    
    const user = await User.findById(userId)
      .populate('following', 'username name bio avatar followers following')
      .select('following');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const followingWithCounts = user.following.map(following => ({
      ...following.toObject(),
      followersCount: following.followers?.length || 0,
      followingCount: following.following?.length || 0,
      isFollowing: following.followers?.includes(currentUserId) || false
    }));
    
    res.json(followingWithCounts);
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
