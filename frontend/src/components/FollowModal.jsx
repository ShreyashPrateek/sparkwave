import { useState, useEffect } from "react";
import { X, UserPlus, UserMinus } from "lucide-react";
import api from "../api/axios";

export default function FollowModal({ isOpen, onClose, type, userId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const endpoint = type === 'followers' ? 'followers' : 'following';
      const response = await api.get(`/api/users/${userId}/${endpoint}`);
      setUsers(response.data);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId) => {
    try {
      await api.post(`/api/users/${targetUserId}/follow`);
      setUsers(prev => 
        prev.map(user => 
          user._id === targetUserId 
            ? { ...user, isFollowing: true, followersCount: user.followersCount + 1 }
            : user
        )
      );
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async (targetUserId) => {
    try {
      await api.post(`/api/users/${targetUserId}/unfollow`);
      setUsers(prev => 
        prev.map(user => 
          user._id === targetUserId 
            ? { ...user, isFollowing: false, followersCount: user.followersCount - 1 }
            : user
        )
      );
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 backdrop-blur-lg bg-white bg-opacity-10 rounded-2xl border border-white border-opacity-20 max-h-96 overflow-hidden">
        <div className="p-4 border-b border-white border-opacity-20 flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg capitalize">{type}</h3>
          <button
            onClick={onClose}
            className="p-1 text-purple-200 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            </div>
          ) : users.length > 0 ? (
            users.map(user => (
              <div key={user._id} className="p-4 border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-10 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {(user.name || user.username).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{user.name || user.username}</h4>
                      <p className="text-purple-200 text-sm">@{user.username}</p>
                      {user.bio && <p className="text-purple-300 text-xs mt-1">{user.bio}</p>}
                      <div className="flex gap-3 mt-1 text-xs text-purple-300">
                        <span>{user.followersCount} followers</span>
                        <span>{user.followingCount} following</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user.isFollowing && (
                      <button
                        onClick={() => window.location.href = `/chat?user=${user._id}`}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                      >
                        Message
                      </button>
                    )}
                    <button
                      onClick={() => user.isFollowing ? handleUnfollow(user._id) : handleFollow(user._id)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                        user.isFollowing
                          ? "bg-gray-600 text-white hover:bg-gray-700"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transform hover:scale-105"
                      }`}
                    >
                      {user.isFollowing ? <UserMinus size={16} /> : <UserPlus size={16} />}
                      {user.isFollowing ? "Unfollow" : "Follow"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-purple-200">No {type} yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}