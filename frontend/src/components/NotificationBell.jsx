import { useState } from "react";
import { Bell, X, Heart, MessageCircle, UserPlus, Share2 } from "lucide-react";

export default function NotificationBell() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      type: "like",
      user: "Alex Rivera",
      avatar: "AR",
      message: "liked your post",
      time: "2m ago",
      read: false
    },
    {
      id: 2,
      type: "comment",
      user: "Jordan Lee",
      avatar: "JL",
      message: "commented on your post",
      time: "5m ago",
      read: false
    },
    {
      id: 3,
      type: "follow",
      user: "Emma Watson",
      avatar: "EW",
      message: "started following you",
      time: "1h ago",
      read: true
    },
    {
      id: 4,
      type: "share",
      user: "Chris Evans",
      avatar: "CE",
      message: "shared your post",
      time: "2h ago",
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case "like": return <Heart size={16} className="text-pink-400" />;
      case "comment": return <MessageCircle size={16} className="text-blue-400" />;
      case "follow": return <UserPlus size={16} className="text-green-400" />;
      case "share": return <Share2 size={16} className="text-purple-400" />;
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
          <div className="absolute right-0 top-full mt-2 w-80 backdrop-blur-lg bg-white bg-opacity-10 rounded-2xl border border-white border-opacity-20 z-50 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-white border-opacity-20 flex items-center justify-between">
              <h3 className="text-white font-semibold">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 text-purple-200 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-10 transition-all cursor-pointer ${
                      !notification.read ? 'bg-white bg-opacity-5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {notification.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getIcon(notification.type)}
                          <p className="text-white text-sm">
                            <span className="font-semibold">{notification.user}</span>{" "}
                            {notification.message}
                          </p>
                        </div>
                        <p className="text-purple-300 text-xs">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Bell className="mx-auto mb-3 text-purple-300" size={32} />
                  <p className="text-purple-200">No notifications yet</p>
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-4 border-t border-white border-opacity-20">
                <button className="w-full text-center text-purple-200 hover:text-white text-sm transition-colors">
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