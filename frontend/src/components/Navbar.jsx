import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Search, User, LogOut, Menu, X, TrendingUp, MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Search, label: "Discover", path: "/discover" },
    { icon: MessageCircle, label: "Messages", path: "/chat" },
    { icon: User, label: "Profile", path: "/profile" }
  ];

  return (
    <nav className="relative z-20 backdrop-blur-lg bg-white bg-opacity-10 border-b border-white border-opacity-20">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <button 
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl p-1.5 sm:p-2">
              <TrendingUp className="text-white" size={18} />
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-white">Spark Wave</h1>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3 sm:gap-6">
            {navItems.map(({ icon: Icon, label, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="text-white hover:text-purple-200 transition-colors p-1.5 sm:p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
              >
                <Icon size={20} />
              </button>
            ))}
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="text-white hover:text-purple-200 transition-colors p-1.5 sm:p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-1.5"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 space-y-1">
            {navItems.map(({ icon: Icon, label, path }) => (
              <button
                key={label}
                onClick={() => {
                  navigate(path);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left text-white hover:bg-white hover:bg-opacity-10 p-2.5 rounded-lg flex items-center gap-3 text-sm"
              >
                <Icon size={18} /> {label}
              </button>
            ))}
            <div className="px-2.5 py-2">
              <NotificationBell />
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left text-white hover:bg-white hover:bg-opacity-10 p-2.5 rounded-lg flex items-center gap-3 text-sm"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}