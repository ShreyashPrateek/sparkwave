import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:2000/api"
      : "https://sparkwave-backend-skvy.onrender.com/api",  // Your production URL
  withCredentials: false, // Only true if using cookies-based auth
});

// ✅ Automatically attach token to request headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // or sessionStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
