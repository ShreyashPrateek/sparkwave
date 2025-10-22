import { useState, useEffect, useRef } from "react";
import { Send, Search, Phone, Video, MoreVertical, Smile } from "lucide-react";
import Navbar from "../components/Navbar";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Chat() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const { socket, onlineUsers } = useSocket();
  const { user } = useAuth();

  // Fetch chats on component mount
  useEffect(() => {
    fetchChats();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (selectedChat && 
          (newMessage.sender._id === selectedChat._id || newMessage.receiver._id === selectedChat._id)) {
        setMessages(prev => [...prev, newMessage]);
      }
      fetchChats(); // Update chat list
    });

    socket.on("messageSent", (sentMessage) => {
      setMessages(prev => [...prev, sentMessage]);
      fetchChats(); // Update chat list
    });

    socket.on("userTyping", ({ userId, username }) => {
      if (selectedChat && userId === selectedChat._id) {
        setTyping(username);
      }
    });

    socket.on("userStoppedTyping", ({ userId }) => {
      if (selectedChat && userId === selectedChat._id) {
        setTyping(null);
      }
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageSent");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
    };
  }, [socket, selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
      markAsRead(selectedChat._id);
    }
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      const res = await api.get("/chat");
      setChats(res.data);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await api.get(`/chat/${userId}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const markAsRead = async (userId) => {
    try {
      await api.put(`/chat/${userId}/read`);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() && selectedChat && socket) {
      socket.emit("sendMessage", {
        receiverId: selectedChat._id,
        text: message.trim()
      });
      setMessage("");
      handleStopTyping();
    }
  };

  const handleTyping = () => {
    if (selectedChat && socket) {
      socket.emit("typing", { receiverId: selectedChat._id });
      
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        handleStopTyping();
      }, 1000);
    }
  };

  const handleStopTyping = () => {
    if (selectedChat && socket) {
      socket.emit("stopTyping", { receiverId: selectedChat._id });
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAvatar = (chatUser) => {
    return (chatUser.name || chatUser.username).slice(0, 2).toUpperCase();
  };

  const isOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const filteredChats = chats.filter(chat =>
    (chat.name || chat.username).toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
          {/* Chat List */}
          <div className="lg:col-span-4 backdrop-blur-lg bg-white bg-opacity-10 rounded-2xl border border-white border-opacity-20 overflow-hidden">
            <div className="p-6 border-b border-white border-opacity-20">
              <h2 className="text-2xl font-bold text-white mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>

            <div className="overflow-y-auto h-full">
              {filteredChats.length > 0 ? filteredChats.map(chat => (
                <button
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full p-4 text-left hover:bg-white hover:bg-opacity-10 transition-all border-b border-white border-opacity-10 ${
                    selectedChat?._id === chat._id ? 'bg-white bg-opacity-20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {getAvatar(chat)}
                      </div>
                      {isOnline(chat._id) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-purple-900"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-semibold truncate">{chat.name || chat.username}</h3>
                        <span className="text-purple-300 text-xs">
                          {chat.lastMessageTime ? formatTime(chat.lastMessageTime) : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-purple-200 text-sm truncate">{chat.lastMessage || 'No messages yet'}</p>
                        {chat.unreadCount > 0 && (
                          <span className="bg-pink-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )) : (
                <div className="p-8 text-center">
                  <p className="text-purple-200">No conversations yet</p>
                  <p className="text-purple-300 text-sm mt-2">Start a conversation by visiting someone's profile</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-8 backdrop-blur-lg bg-white bg-opacity-10 rounded-2xl border border-white border-opacity-20 overflow-hidden flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-white border-opacity-20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {getAvatar(selectedChat)}
                      </div>
                      {isOnline(selectedChat._id) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-purple-900"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{selectedChat.name || selectedChat.username}</h3>
                      <p className="text-purple-200 text-sm">
                        {typing ? `${typing} is typing...` : isOnline(selectedChat._id) ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all">
                      <Phone size={20} />
                    </button>
                    <button className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all">
                      <Video size={20} />
                    </button>
                    <button className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {messages.length > 0 ? messages.map(msg => {
                    const isMe = msg.sender._id === user.id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            isMe
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-white bg-opacity-20 text-white'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p className={`text-xs mt-1 ${
                            isMe ? 'text-purple-100' : 'text-purple-300'
                          }`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-purple-200">No messages yet. Start the conversation!</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-white border-opacity-20">
                  <div className="flex items-center gap-3">
                    <button className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all">
                      <Smile size={20} />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          handleTyping();
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSendMessage();
                          }
                        }}
                        className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    💬
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">Select a conversation</h3>
                  <p className="text-purple-200">Choose a chat from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}