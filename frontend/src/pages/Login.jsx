// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const successMessage = location.state?.message;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });

      const token = res.data?.accessToken || res.data?.token;
      if (!token) throw new Error("No access token returned from server");

      // Use AuthContext login method
      login(res.data.user, token);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-md z-10">
        <div className="backdrop-blur-lg bg-white bg-opacity-10 rounded-3xl shadow-2xl p-8 border border-white border-opacity-20">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
              <Lock className="text-white" size={32} />
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-purple-200">Sign in to continue your journey</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-5 p-4 bg-green-500 bg-opacity-20 border border-green-400 rounded-lg flex items-center gap-2 justify-center">
              <CheckCircle size={20} className="text-green-100" />
              <p className="text-green-100 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-4 bg-red-500 bg-opacity-20 border border-red-400 rounded-lg">
              <p className="text-red-100 text-sm text-center">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="text-purple-300" size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                autoComplete="email"
                className="w-full pl-12 pr-4 py-4 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white focus:bg-opacity-20 transition-all"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="text-purple-300" size={20} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full pl-12 pr-4 py-4 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white focus:bg-opacity-20 transition-all"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Logging in..." : "Sign In"}
              {!loading && <ArrowRight size={20} />}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-purple-200">
              Don't have an account?{' '}
              <a
                href="/register"
                className="text-white font-semibold hover:underline transition-all"
              >
                Create Account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}