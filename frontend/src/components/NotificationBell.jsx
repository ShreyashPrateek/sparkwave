import { useState, useEffect } from "react";
import { Bell, X, Heart, MessageCircle, UserPlus, Share2 } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import api from "../api/axios";

export default function NotificationBell() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { notifications: realtimeNotifications } = useSocket();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (realtimeNotifications.length > 0) {
      setNotifications(prev => {
        const newNotifications = realtimeNotifications.filter(
          newNotif => !prev.some(existing => existing._id === newNotif._id)
        );
        return [...newNotifications, ...prev];
      });
    }
  }, [realtimeNotifications]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/api/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/api/notifications/read-all");
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInMinutes = Math.floor((now - notifDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case "like": return <Heart size={16} className="text-pink-400" />;
      case "comment": return <MessageCircle size={16} className="text-blue-400" />;
      case "follow": return <UserPlus size={16} className="text-green-400" />;
      case "message": return <MessageCircle size={16} className="text-blue-400" />;
      default: return <Bell size={16} />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-white hover:text-purple-200 transition-colors rounded-lg hover:bg-white hover:bg-opacity-10"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowNotifications(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-700 z-50 max-h-80 sm:max-h-96 overflow-hidden shadow-xl">
            <div className="p-3 sm:p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm sm:text-base">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 text-purple-200 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="max-h-64 sm:max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div
                    key={notification._id}
                    onClick={() => !notification.read && markAsRead(notification._id)}
                    className={`p-3 sm:p-4 border-b border-gray-700 hover:bg-gray-700 transition-all cursor-pointer ${
                      !notification.read ? 'bg-gray-700' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                        {notification.sender?.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1">
                          {getIcon(notification.type)}
                          <p className="text-white text-xs sm:text-sm">
                            <span className="font-semibold">{notification.sender?.username}</span>{" "}
                            {notification.message}
                          </p>
                        </div>
                        <p className="text-purple-300 text-xs">{getTimeAgo(notification.createdAt)}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-pink-500 rounded-full mt-1 sm:mt-2 flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 sm:p-8 text-center">
                  <Bell className="mx-auto mb-2 sm:mb-3 text-purple-300" size={24} />
                  <p className="text-purple-200 text-sm sm:text-base">No notifications yet</p>
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-3 sm:p-4 border-t border-gray-700">
                <button 
                  onClick={markAllAsRead}
                  className="w-full text-center text-purple-200 hover:text-white text-xs sm:text-sm transition-colors"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}