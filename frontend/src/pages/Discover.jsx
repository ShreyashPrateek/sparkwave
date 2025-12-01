import { useState, useEffect } from "react";
import { Search, UserPlus, Users, TrendingUp } from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function Discover() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const fetchSuggestedUsers = async () => {
    try {
      const response = await api.get("/api/users/suggested");
      setSuggestedUsers(response.data);
    } catch (error) {
      console.error("Error fetching suggested users:", error);
    }
  };

  const searchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/users/search?q=${searchTerm}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await api.post(`/api/users/${userId}/follow`);
      
      // Update suggested users
      setSuggestedUsers(prev => 
        prev.map(user => 
          user._id === userId 
            ? { ...user, isFollowing: true, followersCount: user.followersCount + 1 }
            : user
        )
      );
      
      // Update search results
      setSearchResults(prev => 
        prev.map(user => 
          user._id === userId 
            ? { ...user, isFollowing: true, followersCount: user.followersCount + 1 }
            : user
        )
      );
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await api.post(`/api/users/${userId}/unfollow`);
      
      // Update suggested users
      setSuggestedUsers(prev => 
        prev.map(user => 
          user._id === userId 
            ? { ...user, isFollowing: false, followersCount: user.followersCount - 1 }
            : user
        )
      );
      
      // Update search results
      setSearchResults(prev => 
        prev.map(user => 
          user._id === userId 
            ? { ...user, isFollowing: false, followersCount: user.followersCount - 1 }
            : user
        )
      );
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  const UserCard = ({ user, showFollowButton = true }) => (
    <div className="backdrop-blur-lg bg-white bg-opacity-10 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white border-opacity-20">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0">
            {(user.name || user.username).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-semibold text-base sm:text-lg truncate">{user.name || user.username}</h3>
            <p className="text-purple-200 text-sm truncate">@{user.username}</p>
            {user.bio && <p className="text-purple-300 text-xs sm:text-sm mt-1 line-clamp-2">{user.bio}</p>}
            <div className="flex gap-3 sm:gap-4 mt-1 sm:mt-2 text-xs sm:text-sm">
              <span className="text-purple-200">{user.followersCount} followers</span>
              <span className="text-purple-200">{user.followingCount} following</span>
            </div>
          </div>
        </div>
        {showFollowButton && (
          <div className="flex gap-2 sm:gap-3 flex-shrink-0">
            {user.isFollowing && (
              <button
                onClick={() => window.location.href = `/chat?user=${user._id}`}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-xs sm:text-sm"
              >
                Message
              </button>
            )}
            <button
              onClick={() => user.isFollowing ? handleUnfollow(user._id) : handleFollow(user._id)}
              className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm ${
                user.isFollowing
                  ? "bg-gray-600 text-white hover:bg-gray-700"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transform hover:scale-105"
              }`}
            >
              {user.isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">Discover People</h1>
          <p className="text-purple-200 text-sm sm:text-base px-2">Find and connect with amazing people on Spark Wave</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 sm:mb-8">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-purple-300" size={18} />
          <input
            type="text"
            placeholder="Search for users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl sm:rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 backdrop-blur-lg text-sm sm:text-base"
          />
        </div>

        {/* Search Results */}
        {searchTerm.length >= 2 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Search size={20} />
              <span className="text-sm sm:text-base">Search Results</span>
            </h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {searchResults.map(user => (
                  <UserCard key={user._id} user={user} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <p className="text-purple-200 text-sm sm:text-base">No users found matching "{searchTerm}"</p>
              </div>
            )}
          </div>
        )}

        {/* Suggested Users */}
        {(!searchTerm || searchTerm.length < 2) && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <TrendingUp size={20} />
              <span className="text-sm sm:text-base">Suggested for You</span>
            </h2>
            {suggestedUsers.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {suggestedUsers.map(user => (
                  <UserCard key={user._id} user={user} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <Users className="mx-auto mb-3 sm:mb-4 text-purple-300" size={36} />
                <p className="text-purple-200 text-sm sm:text-base">No suggested users at the moment</p>
                <p className="text-purple-300 text-xs sm:text-sm mt-2">Check back later for new people to follow!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}