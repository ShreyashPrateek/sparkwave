import { useState } from "react";
import { Send, Search, Phone, Video, MoreVertical, Smile } from "lucide-react";
import Navbar from "../components/Navbar";

export default function Chat() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [chats] = useState([
    {
      id: 1,
      name: "Alex Rivera",
      username: "@alexr",
      avatar: "AR",
      lastMessage: "Hey! How's the project going?",
      time: "2m ago",
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: "Jordan Lee",
      username: "@jordanl",
      avatar: "JL",
      lastMessage: "Thanks for the help earlier!",
      time: "1h ago",
      unread: 0,
      online: false
    },
    {
      id: 3,
      name: "Emma Watson",
      username: "@emmaw",
      avatar: "EW",
      lastMessage: "Let's catch up soon 😊",
      time: "3h ago",
      unread: 1,
      online: true
    }
  ]);

  const [messages] = useState({
    1: [
      { id: 1, text: "Hey! How's the project going?", sender: "them", time: "2:30 PM" },
      { id: 2, text: "It's going great! Just finished the authentication system", sender: "me", time: "2:32 PM" },
      { id: 3, text: "That's awesome! Can't wait to see it", sender: "them", time: "2:33 PM" }
    ]
  });

  const handleSendMessage = () => {
    if (message.trim() && selectedChat) {
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
              {filteredChats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full p-4 text-left hover:bg-white hover:bg-opacity-10 transition-all border-b border-white border-opacity-10 ${
                    selectedChat?.id === chat.id ? 'bg-white bg-opacity-20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {chat.avatar}
                      </div>
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-purple-900"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-semibold truncate">{chat.name}</h3>
                        <span className="text-purple-300 text-xs">{chat.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-purple-200 text-sm truncate">{chat.lastMessage}</p>
                        {chat.unread > 0 && (
                          <span className="bg-pink-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
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
                        {selectedChat.avatar}
                      </div>
                      {selectedChat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-purple-900"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{selectedChat.name}</h3>
                      <p className="text-purple-200 text-sm">
                        {selectedChat.online ? "Online" : "Offline"}
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
                  {messages[selectedChat.id]?.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          msg.sender === 'me'
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-white bg-opacity-20 text-white'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'me' ? 'text-purple-100' : 'text-purple-300'
                        }`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
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
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Send className="text-white" size={32} />
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">Select a conversation</h3>
                  <p className="text-purple-200">Choose from your existing conversations or start a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}