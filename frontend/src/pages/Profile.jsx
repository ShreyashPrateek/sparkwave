import { useState, useEffect } from "react";
import { Edit2, MapPin, Calendar, ExternalLink, Heart, MessageCircle, Share2, Grid, Bookmark, Camera, Settings } from "lucide-react";
import Navbar from "../components/Navbar";
import FollowModal from "../components/FollowModal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../api/axios";

export default function SparkWaveProfile() {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.username || "",
    username: `@${user?.username || ""}`,
    bio: "",
    location: "",
    website: "",
    joinDate: "January 2024",
    avatar: user?.username?.slice(0, 2).toUpperCase() || "U",
    coverGradient: "from-purple-500 to-pink-500"
  });

  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0
  });

  const [profileLoaded, setProfileLoaded] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [modalType, setModalType] = useState('followers');
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user && !profileLoaded) {
        try {
          const res = await api.get('/api/users/me');
          const userData = res.data;
          
          setProfile({
            name: userData.name || userData.username,
            username: `@${userData.username}`,
            bio: userData.bio || "",
            location: userData.location || "",
            website: userData.website || "",
            joinDate: new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            avatar: (userData.name || userData.username).slice(0, 2).toUpperCase(),
            coverGradient: "from-purple-500 to-pink-500"
          });
          
          setStats({
            posts: 0, // Will be updated when we fetch user posts
            followers: userData.followers?.length || 0,
            following: userData.following?.length || 0
          });
          
          // Store user ID for modal
          setCurrentUserId(userData._id);
          
          // Fetch user's posts
          const postsRes = await api.get(`/api/users/${userData._id}/posts`);
          setUserPosts(postsRes.data);
          setStats(prev => ({ ...prev, posts: postsRes.data.length }));
          
          setProfileLoaded(true);
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          // Fallback to user data
          setProfile(prev => ({
            ...prev,
            name: user.username,
            username: `@${user.username}`,
            avatar: user.username.slice(0, 2).toUpperCase()
          }));
          setProfileLoaded(true);
        }
      }
    };
    
    fetchProfile();
  }, [user, profileLoaded]);

  const formatTime = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const [savedPosts] = useState([
    {
      id: 101,
      author: "Sarah Chen",
      username: "@sarahc",
      avatar: "SC",
      content: "10 design principles every developer should know 🎨",
      time: "1w ago",
      likes: 892,
      comments: 124,
      shares: 67
    },
    {
      id: 102,
      author: "Mike Ross",
      username: "@mikeross",
      avatar: "MR",
      content: "The best productivity tools for remote work in 2024",
      time: "2w ago",
      likes: 654,
      comments: 89,
      shares: 156
    }
  ]);

  const handleLike = async (postId) => {
    try {
      await api.post(`/api/posts/${postId}/like`);
      // Update local post state
      setUserPosts(prev => 
        prev.map(post => 
          post._id === postId 
            ? { ...post, likes: post.likes?.includes(user.id) 
                ? post.likes.filter(id => id !== user.id)
                : [...(post.likes || []), user.id] }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleSaveProfile = async () => {
    console.log('🔄 Starting profile save...');
    console.log('📝 Profile data to save:', profile);
    
    setLoading(true);
    try {
      const updateData = {
        username: profile.username.replace('@', ''),
        name: profile.name,
        bio: profile.bio,
        location: profile.location,
        website: profile.website
      };
      
      console.log('📤 Sending update data:', updateData);
      const response = await api.put('/api/users/profile', updateData);
      console.log('✅ Profile updated successfully:', response.data);
      
      // Update AuthContext with new user data
      const updatedUser = {
        ...user,
        username: updateData.username,
        name: updateData.name
      };
      updateUser(updatedUser);
      
      // Update local state immediately
      setProfile(prev => ({
        ...prev,
        name: updateData.name,
        username: `@${updateData.username}`,
        bio: updateData.bio,
        location: updateData.location,
        website: updateData.website,
        avatar: updateData.name.slice(0, 2).toUpperCase()
      }));
      
      setIsEditing(false);
      success('Profile updated successfully!');
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      console.error('Error details:', error.response?.data);
      error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="backdrop-blur-lg bg-white bg-opacity-10 rounded-2xl sm:rounded-3xl border border-white border-opacity-20 overflow-hidden mb-4 sm:mb-6">
          <div className={`h-32 sm:h-48 bg-gradient-to-r ${profile.coverGradient} relative`}>
            <button className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 backdrop-blur-lg rounded-lg text-white hover:bg-opacity-30 transition-all">
              <Camera size={20} />
            </button>
          </div>

          <div className="px-3 sm:px-6 pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-16 mb-4">
              <div className="relative mb-4 sm:mb-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-4 border-purple-900 flex items-center justify-center text-white text-2xl sm:text-4xl font-bold">
                  {profile.avatar}
                </div>
                <button className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-1.5 sm:p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white hover:shadow-lg transform hover:scale-110 transition-all">
                  <Camera size={14} />
                </button>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 sm:px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                >
                  {isEditing ? <Settings size={16} /> : <Edit2 size={16} />}
                  <span className="hidden sm:inline">{isEditing ? "Settings" : "Edit Profile"}</span>
                  <span className="sm:hidden">{isEditing ? "Settings" : "Edit"}</span>
                </button>
              </div>
            </div>

            {!isEditing ? (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h2 className="text-xl sm:text-3xl font-bold text-white mb-1">{profile.name}</h2>
                  <p className="text-purple-200 text-sm sm:text-base">{profile.username}</p>
                </div>

                <p className="text-white text-sm sm:text-lg">{profile.bio}</p>

                <div className="flex flex-wrap gap-3 sm:gap-4 text-purple-200 text-xs sm:text-sm">
                  {profile.location && (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <MapPin size={14} />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <ExternalLink size={14} />
                      <a href={`https://${profile.website}`} className="hover:text-white transition-colors truncate">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Calendar size={14} />
                    <span>Joined {profile.joinDate}</span>
                  </div>
                </div>

                <div className="flex gap-4 sm:gap-6 pt-3 sm:pt-4 border-t border-white border-opacity-20">
                  <div>
                    <span className="text-white font-bold text-lg sm:text-xl">{stats.posts}</span>
                    <span className="text-purple-200 ml-1 sm:ml-2 text-sm sm:text-base">Posts</span>
                  </div>
                  <button 
                    onClick={() => {
                      setModalType('followers');
                      setShowFollowModal(true);
                    }}
                    className="hover:scale-105 transition-transform"
                  >
                    <span className="text-white font-bold text-lg sm:text-xl">{stats.followers}</span>
                    <span className="text-purple-200 ml-1 sm:ml-2 text-sm sm:text-base">Followers</span>
                  </button>
                  <button 
                    onClick={() => {
                      setModalType('following');
                      setShowFollowModal(true);
                    }}
                    className="hover:scale-105 transition-transform"
                  >
                    <span className="text-white font-bold text-lg sm:text-xl">{stats.following}</span>
                    <span className="text-purple-200 ml-1 sm:ml-2 text-sm sm:text-base">Following</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-purple-200 text-sm mb-2 block">Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value, avatar: e.target.value.slice(0, 2).toUpperCase()})}
                      className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl p-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div>
                    <label className="text-purple-200 text-sm mb-2 block">Username</label>
                    <input
                      type="text"
                      value={profile.username.replace('@', '')}
                      onChange={(e) => setProfile({...profile, username: `@${e.target.value}`})}
                      className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl p-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-purple-200 text-sm mb-2 block">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl p-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none h-24"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-purple-200 text-sm mb-2 block">Location</label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                      className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl p-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  <div>
                    <label className="text-purple-200 text-sm mb-2 block">Website</label>
                    <input
                      type="text"
                      value={profile.website}
                      onChange={(e) => setProfile({...profile, website: e.target.value})}
                      className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl p-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 rounded-xl text-white hover:bg-white hover:bg-opacity-10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="px-4 sm:px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="backdrop-blur-lg bg-white bg-opacity-10 rounded-2xl border border-white border-opacity-20 mb-6">
          <div className="flex border-b border-white border-opacity-20">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === "posts"
                  ? "text-white border-b-2 border-pink-500"
                  : "text-purple-200 hover:text-white"
              }`}
            >
              <Grid size={20} />
              <span className="hidden sm:inline">Posts</span>
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === "saved"
                  ? "text-white border-b-2 border-pink-500"
                  : "text-purple-200 hover:text-white"
              }`}
            >
              <Bookmark size={20} />
              <span className="hidden sm:inline">Saved</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {activeTab === "posts" && (
            <>
              {userPosts.length > 0 ? userPosts.map(post => (
                <div
                  key={post._id}
                  className="backdrop-blur-lg bg-white bg-opacity-10 rounded-2xl p-6 border border-white border-opacity-20 hover:bg-opacity-15 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {profile.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-white font-semibold">{profile.name}</h3>
                          <p className="text-purple-200 text-sm">{profile.username} · {formatTime(post.createdAt)}</p>
                        </div>
                      </div>
                      <p className="text-white mb-4">{post.text}</p>
                      
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleLike(post._id)}
                          className="flex items-center gap-2 text-purple-200 hover:text-pink-400 transition-colors group"
                        >
                          <Heart
                            size={20}
                            className="group-hover:scale-110 transition-transform"
                          />
                          <span className="text-sm">{post.likes?.length || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 text-purple-200 hover:text-purple-400 transition-colors">
                          <MessageCircle size={20} />
                          <span className="text-sm">{post.comments?.length || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 text-purple-200 hover:text-purple-400 transition-colors">
                          <Share2 size={20} />
                          <span className="text-sm">0</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 backdrop-blur-lg bg-white bg-opacity-10 rounded-2xl border border-white border-opacity-20">
                  <p className="text-purple-200 mb-4">No posts yet!</p>
                  <p className="text-purple-300 text-sm">Share your first post to get started</p>
                </div>
              )}
            </>
          )}

          {activeTab === "saved" && (
            <>
              {savedPosts.map(post => (
                <div
                  key={post.id}
                  className="backdrop-blur-lg bg-white bg-opacity-10 rounded-2xl p-6 border border-white border-opacity-20 hover:bg-opacity-15 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {post.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-white font-semibold">{post.author}</h3>
                          <p className="text-purple-200 text-sm">{post.username} · {post.time}</p>
                        </div>
                        <Bookmark className="text-pink-400 fill-pink-400" size={20} />
                      </div>
                      <p className="text-white mb-4">{post.content}</p>
                      
                      <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-purple-200 hover:text-pink-400 transition-colors">
                          <Heart size={20} />
                          <span className="text-sm">{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-purple-200 hover:text-purple-400 transition-colors">
                          <MessageCircle size={20} />
                          <span className="text-sm">{post.comments}</span>
                        </button>
                        <button className="flex items-center gap-2 text-purple-200 hover:text-purple-400 transition-colors">
                          <Share2 size={20} />
                          <span className="text-sm">{post.shares}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      
      <FollowModal
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
        type={modalType}
        userId={currentUserId}
      />
    </div>
  );
}