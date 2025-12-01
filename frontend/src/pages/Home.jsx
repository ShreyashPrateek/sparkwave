import { useState, useEffect } from "react";
import { Plus, TrendingUp, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../api/axios";

export default function SparkWaveHome() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [posts, setPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [userStats, setUserStats] = useState({ posts: 0, followers: 0, following: 0 });

  const [newPost, setNewPost] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
    fetchSuggestedUsers();
    fetchUserStats();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await api.get("/api/posts");
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedUsers = async () => {
    try {
      const response = await api.get("/api/users/suggested");
      setSuggestedUsers(response.data.slice(0, 3));
    } catch (error) {
      console.error("Error fetching suggested users:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await api.get("/api/users/me");
      const userData = response.data;
      setUserStats({
        posts: 0, // Will be updated when we implement user posts count
        followers: userData.followers?.length || 0,
        following: userData.following?.length || 0
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/api/posts/${postId}/like`);
      // Update local state
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
          : post
      ));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await api.post(`/api/users/${userId}/follow`);
      setSuggestedUsers(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleCreatePost = async () => {
    if (newPost.trim()) {
      try {
        const response = await api.post('/api/posts', { text: newPost });
        setPosts([response.data, ...posts]);
        setNewPost("");
        setShowCreatePost(false);
      } catch (error) {
        if (error.response?.data?.reason === "toxic_content") {
          error("Post blocked: Content violates community guidelines");
        } else {
          error("Failed to create post");
        }
      }
    }
  };

  const trending = [
    { tag: "#SparkWave", posts: "12.5K" },
    { tag: "#TechNews", posts: "8.3K" },
    { tag: "#Innovation", posts: "5.7K" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="backdrop-blur-lg bg-white bg-opacity-10 rounded-2xl p-6 border border-white border-opacity-20 sticky top-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {(user?.name || user?.username)?.slice(0, 2).toUpperCase() || "YO"}
                </div>
                <h3 className="text-white font-semibold text-lg">{user?.name || user?.username || 'Your Name'}</h3>
                <p className="text-purple-200 text-sm">@{user?.username || 'username'}</p>
                
                <div className="mt-6 pt-6 border-t border-white border-opacity-20 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-200">Posts</span>
                    <span className="text-white font-semibold">{userStats.posts}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-200">Followers</span>
                    <span className="text-white font-semibold">{userStats.followers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-200">Following</span>
                    <span className="text-white font-semibold">{userStats.following}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-6 space-y-3 sm:space-y-6">
            {/* Create Post Button */}
            <button
              onClick={() => setShowCreatePost(!showCreatePost)}
              className="w-full backdrop-blur-lg bg-white bg-opacity-10 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all flex items-center gap-3 sm:gap-4"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Plus className="text-white" size={20} />
              </div>
              <span className="text-purple-200 text-sm sm:text-base">What's on your mind?</span>
            </button>

            {/* Create Post Form */}
            {showCreatePost && (
              <div className="backdrop-blur-lg bg-white bg-opacity-10 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white border-opacity-20">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg sm:rounded-xl p-3 sm:p-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none h-24 sm:h-32 text-sm sm:text-base"
                />
                <div className="flex justify-end gap-2 sm:gap-3 mt-3 sm:mt-4">
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="px-3 sm:px-6 py-2 rounded-lg text-white hover:bg-white hover:bg-opacity-10 transition-all text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    className="px-3 sm:px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all text-sm sm:text-base"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                </div>
              ) : posts.length > 0 ? (
                posts.map(post => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onLike={handleLike}
                  />
                ))
              ) : (
                <div className="text-center py-6 sm:py-8 backdrop-blur-lg bg-white bg-opacity-10 rounded-xl sm:rounded-2xl border border-white border-opacity-20">
                  <p className="text-purple-200 mb-2 sm:mb-4 text-sm sm:text-base">No posts yet!</p>
                  <p className="text-purple-300 text-xs sm:text-sm">Follow some users to see their posts in your feed</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            {/* Trending Topics */}
            <div className="backdrop-blur-lg bg-white bg-opacity-10 rounded-2xl p-6 border border-white border-opacity-20 sticky top-8">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp size={20} />
                Trending
              </h3>
              <div className="space-y-4">
                {trending.map((trend, idx) => (
                  <div key={idx} className="hover:bg-white hover:bg-opacity-10 p-3 rounded-lg transition-all cursor-pointer">
                    <p className="text-white font-semibold">{trend.tag}</p>
                    <p className="text-purple-200 text-sm">{trend.posts} posts</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Users */}
            <div className="backdrop-blur-lg bg-white bg-opacity-10 rounded-2xl p-6 border border-white border-opacity-20">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Users size={20} />
                Suggestions
              </h3>
              <div className="space-y-4">
                {suggestedUsers.length > 0 ? suggestedUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {(user.name || user.username).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{user.name || user.username}</p>
                        <p className="text-purple-200 text-xs">@{user.username}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleFollow(user._id)}
                      className="px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-sm font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                    >
                      Follow
                    </button>
                  </div>
                )) : (
                  <p className="text-purple-200 text-sm text-center">No suggestions available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}