import { useState } from "react";
import { Plus, TrendingUp, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";

export default function SparkWaveHome() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Shreyash Prateek",
      username: "@sshreyash",
      avatar: "SP",
      time: "2h ago",
      content: "Just launched my new project! Can't wait to share more details with you all. Stay tuned! 🚀",
      likes: 234,
      comments: 45,
      shares: 12,
      liked: false
    },
    {
      id: 2,
      author: "Alex Rivera",
      username: "@alexr",
      avatar: "AR",
      time: "4h ago",
      content: "Beautiful sunset today. Nature never fails to amaze me. 🌅",
      likes: 512,
      comments: 89,
      shares: 34,
      liked: true
    },
    {
      id: 3,
      author: "Jordan Lee",
      username: "@jordanl",
      avatar: "JL",
      time: "6h ago",
      content: "Hot take: Coffee is overrated. Tea supremacy! ☕️🍵",
      likes: 156,
      comments: 203,
      shares: 45,
      liked: false
    }
  ]);

  const [newPost, setNewPost] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleCreatePost = () => {
    if (newPost.trim()) {
      const post = {
        id: posts.length + 1,
        author: user?.name || user?.username || "You",
        username: `@${user?.username || "you"}`,
        avatar: (user?.name || user?.username)?.slice(0, 2).toUpperCase() || "YO",
        time: "Just now",
        content: newPost,
        likes: 0,
        comments: 0,
        shares: 0,
        liked: false
      };
      setPosts([post, ...posts]);
      setNewPost("");
      setShowCreatePost(false);
    }
  };

  const trending = [
    { tag: "#SparkWave", posts: "12.5K" },
    { tag: "#TechNews", posts: "8.3K" },
    { tag: "#Innovation", posts: "5.7K" }
  ];

  const suggestions = [
    { name: "Emma Watson", username: "@emmaw", avatar: "EW" },
    { name: "Chris Evans", username: "@chrise", avatar: "CE" },
    { name: "Maya Patel", username: "@mayap", avatar: "MP" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
                    <span className="text-white font-semibold">42</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-200">Followers</span>
                    <span className="text-white font-semibold">1.2K</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-200">Following</span>
                    <span className="text-white font-semibold">234</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-6 space-y-6">
            {/* Create Post Button */}
            <button
              onClick={() => setShowCreatePost(!showCreatePost)}
              className="w-full backdrop-blur-lg bg-white bg-opacity-10 rounded-2xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Plus className="text-white" size={24} />
              </div>
              <span className="text-purple-200">What's on your mind?</span>
            </button>

            {/* Create Post Form */}
            {showCreatePost && (
              <div className="backdrop-blur-lg bg-white bg-opacity-10 rounded-2xl p-6 border border-white border-opacity-20">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl p-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none h-32"
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="px-6 py-2 rounded-lg text-white hover:bg-white hover:bg-opacity-10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                />
              ))}
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
                {suggestions.map((user, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{user.name}</p>
                        <p className="text-purple-200 text-xs">{user.username}</p>
                      </div>
                    </div>
                    <button className="px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-sm font-semibold hover:shadow-lg transform hover:scale-105 transition-all">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}