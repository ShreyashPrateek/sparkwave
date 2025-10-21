import { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react";

export default function PostCard({ post, onLike, onComment, onShare }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="backdrop-blur-lg bg-white bg-opacity-10 rounded-2xl p-6 border border-white border-opacity-20 hover:bg-opacity-15 transition-all">
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
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-purple-200 hover:text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all"
              >
                <MoreHorizontal size={20} />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 backdrop-blur-lg bg-white bg-opacity-10 rounded-xl border border-white border-opacity-20 py-2 z-10">
                  <button className="w-full text-left px-4 py-2 text-white hover:bg-white hover:bg-opacity-10 transition-all">
                    Save Post
                  </button>
                  <button className="w-full text-left px-4 py-2 text-white hover:bg-white hover:bg-opacity-10 transition-all">
                    Report
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-white mb-4 leading-relaxed">{post.content}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => onLike?.(post.id)}
                className="flex items-center gap-2 text-purple-200 hover:text-pink-400 transition-colors group"
              >
                <Heart
                  size={20}
                  className={post.liked ? "fill-pink-400 text-pink-400" : "group-hover:scale-110 transition-transform"}
                />
                <span className="text-sm">{post.likes}</span>
              </button>
              
              <button
                onClick={() => onComment?.(post.id)}
                className="flex items-center gap-2 text-purple-200 hover:text-blue-400 transition-colors group"
              >
                <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm">{post.comments}</span>
              </button>
              
              <button
                onClick={() => onShare?.(post.id)}
                className="flex items-center gap-2 text-purple-200 hover:text-green-400 transition-colors group"
              >
                <Share2 size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm">{post.shares}</span>
              </button>
            </div>
            
            <button className="text-purple-200 hover:text-yellow-400 transition-colors">
              <Bookmark size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}