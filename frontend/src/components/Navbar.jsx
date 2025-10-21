import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Search, Bell, User, LogOut, Menu, X, TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";

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
    { icon: Search, label: "Search", path: "/search" },
    { icon: Bell, label: "Notifications", path: "/notifications", hasNotification: true },
    { icon: User, label: "Profile", path: "/profile" }
  ];

  return (
    <nav className="relative z-20 backdrop-blur-lg bg-white bg-opacity-10 border-b border-white border-opacity-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-2">
              <TrendingUp className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white">Spark Wave</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map(({ icon: Icon, label, path, hasNotification }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="text-white hover:text-purple-200 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-10 relative"
              >
                <Icon size={24} />
                {hasNotification && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
                )}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="text-white hover:text-purple-200 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
            >
              <LogOut size={24} />
            </button>
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map(({ icon: Icon, label, path }) => (
              <button
                key={label}
                onClick={() => {
                  navigate(path);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left text-white hover:bg-white hover:bg-opacity-10 p-3 rounded-lg flex items-center gap-3"
              >
                <Icon size={20} /> {label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left text-white hover:bg-white hover:bg-opacity-10 p-3 rounded-lg flex items-center gap-3"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}