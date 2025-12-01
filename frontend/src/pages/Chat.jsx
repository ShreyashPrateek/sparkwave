import { useState, useEffect, useRef } from "react";
import { Send, Search, Phone, Video, MoreVertical, Smile } from "lucide-react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../api/axios";

export default function Chat() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const { socket, onlineUsers, isConnected, connectionStatus } = useSocket();
  const { user } = useAuth();
  const { error } = useToast();
  const location = useLocation();

  // Fetch chats on component mount and handle URL params
  useEffect(() => {
    fetchChats();
    
    // Check if there's a user parameter in URL
    const urlParams = new URLSearchParams(location.search);
    const userId = urlParams.get('user');
    if (userId) {
      // Find or create chat with this user
      startChatWithUser(userId);
    }
  }, [location]);

  const startChatWithUser = async (userId) => {
    try {
      // Fetch user details
      const userResponse = await api.get(`/api/users/${userId}/profile`);
      const targetUser = userResponse.data;
      
      // Create chat object
      const newChat = {
        _id: targetUser._id,
        username: targetUser.username,
        name: targetUser.name || targetUser.username,
        avatar: targetUser.avatar,
        lastMessage: '',
        lastMessageTime: new Date(),
        unreadCount: 0
      };
      
      // Add to chats list if not already there
      setChats(prev => {
        const exists = prev.find(chat => chat._id === userId);
        if (!exists) {
          return [newChat, ...prev];
        }
        return prev;
      });
      
      // Set as selected chat
      setSelectedChat(newChat);
      
      // Clear URL parameter
      window.history.replaceState({}, '', '/chat');
    } catch (error) {
      console.error('Error starting chat with user:', error);
    }
  };

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
      // Replace temporary message with real one
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isTemp || msg.text !== sentMessage.text);
        return [...filtered, sentMessage];
      });
      
      // Update chat list with new message
      setChats(prev => {
        const updatedChats = prev.map(chat => {
          if (chat._id === sentMessage.receiver._id) {
            return {
              ...chat,
              lastMessage: sentMessage.text,
              lastMessageTime: sentMessage.createdAt
            };
          }
          return chat;
        });
        
        // If chat doesn't exist, add it
        const chatExists = prev.find(chat => chat._id === sentMessage.receiver._id);
        if (!chatExists) {
          const newChat = {
            _id: sentMessage.receiver._id,
            username: sentMessage.receiver.username,
            name: sentMessage.receiver.name || sentMessage.receiver.username,
            lastMessage: sentMessage.text,
            lastMessageTime: sentMessage.createdAt,
            unreadCount: 0
          };
          return [newChat, ...updatedChats];
        }
        
        return updatedChats;
      });
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

    socket.on("messageBlocked", ({ reason }) => {
      error(reason);
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageSent");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
      socket.off("messageBlocked");
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
      const res = await api.get("/api/chat");
      setChats(res.data);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await api.get(`/api/chat/${userId}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const markAsRead = async (userId) => {
    try {
      await api.put(`/api/chat/${userId}/read`);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleSendMessage = async () => {
    const messageText = message.trim();
    if (!messageText) return;
    
    if (showAIChat) {
      // Send to AI assistant
      try {
        const res = await api.post("/api/chat/ai", { text: messageText });
        setMessages(prev => [...prev, res.data.userMessage, res.data.aiMessage]);
        setMessage("");
      } catch (error) {
        if (error.response?.data?.reason === "toxic_content") {
          error("Message blocked due to toxic content");
        } else {
          error("Failed to send AI message");
        }
      }
    } else if (selectedChat) {
      if (!socket || !isConnected) {
        error(connectionStatus === 'error' ? "Connection failed. Please refresh." : "Connecting to chat server...");
        return;
      }
      
      // Create temporary message for immediate display
      const tempMessage = {
        _id: `temp_${Date.now()}`,
        text: messageText,
        sender: { _id: user.id, username: user.username, name: user.name },
        receiver: { _id: selectedChat._id, username: selectedChat.username, name: selectedChat.name },
        createdAt: new Date().toISOString(),
        isTemp: true
      };
      
      // Add to messages immediately
      setMessages(prev => [...prev, tempMessage]);
      
      // Clear input immediately
      setMessage("");
      
      // Send to server
      socket.emit("sendMessage", {
        receiverId: selectedChat._id,
        text: messageText
      });
      
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

      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 h-[calc(100vh-8rem)] sm:h-[calc(100vh-12rem)]">
          {/* Chat List */}
          <div className="lg:col-span-4 backdrop-blur-lg bg-white bg-opacity-10 rounded-xl sm:rounded-2xl border border-white border-opacity-20 overflow-hidden">
            <div className="p-3 sm:p-6 border-b border-white border-opacity-20">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Messages</h2>
                <button
                  onClick={() => {
                    setShowAIChat(true);
                    setSelectedChat(null);
                    setMessages([]);
                  }}
                  className="px-2 sm:px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-xs sm:text-sm hover:shadow-lg transition-all"
                >
                  🤖 AI
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={16} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 sm:py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg sm:rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="overflow-y-auto h-full">
              <button
                onClick={() => {
                  setShowAIChat(true);
                  setSelectedChat(null);
                  setMessages([]);
                }}
                className="w-full p-3 sm:p-4 text-left hover:bg-white hover:bg-opacity-10 transition-all border-b border-white border-opacity-10"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                    🤖
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm sm:text-base">Spark Wave AI</h3>
                    <p className="text-purple-200 text-xs sm:text-sm truncate">AI Assistant - Always here to help!</p>
                  </div>
                </div>
              </button>
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
          <div className="lg:col-span-8 backdrop-blur-lg bg-white bg-opacity-10 rounded-xl sm:rounded-2xl border border-white border-opacity-20 overflow-hidden flex flex-col">
            {selectedChat || showAIChat ? (
              <>
                {/* Chat Header */}
                <div className="p-3 sm:p-6 border-b border-white border-opacity-20 flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="relative">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                        {showAIChat ? "🤖" : getAvatar(selectedChat)}
                      </div>
                      {!showAIChat && isOnline(selectedChat._id) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-purple-900"></div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                        {showAIChat ? "Spark Wave AI" : (selectedChat.name || selectedChat.username)}
                      </h3>
                      <p className="text-purple-200 text-xs sm:text-sm truncate">
                        {showAIChat ? "AI Assistant" : 
                         (typing ? `${typing} is typing...` : 
                          !isConnected ? "Connecting..." :
                          isOnline(selectedChat._id) ? "Online" : "Offline")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {showAIChat ? (
                      <button
                        onClick={() => {
                          setShowAIChat(false);
                          setMessages([]);
                        }}
                        className="px-2 sm:px-3 py-1 bg-red-500 rounded-lg text-white text-xs sm:text-sm hover:bg-red-600 transition-all"
                      >
                        Close
                      </button>
                    ) : (
                      <>
                        <button className="p-1.5 sm:p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all">
                          <Phone size={16} />
                        </button>
                        <button className="p-1.5 sm:p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all">
                          <Video size={16} />
                        </button>
                        <button className="p-1.5 sm:p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all">
                          <MoreVertical size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4">
                  {messages.length > 0 ? messages.map(msg => {
                    const isMe = msg.sender._id === user.id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[250px] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl ${
                            isMe
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : msg.isAI
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                              : 'bg-white bg-opacity-20 text-white'
                          }`}
                        >
                          <p className="text-sm sm:text-base break-words">{msg.text}</p>
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
                      <p className="text-purple-200">
                        {showAIChat ? "Ask me anything! I'm here to help." : "No messages yet. Start the conversation!"}
                      </p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-3 sm:p-6 border-t border-white border-opacity-20">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button className="p-1.5 sm:p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all">
                      <Smile size={16} />
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
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg sm:rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm sm:text-base"
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl text-white hover:shadow-lg transform hover:scale-105 transition-all"
                    >
                      <Send size={16} />
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