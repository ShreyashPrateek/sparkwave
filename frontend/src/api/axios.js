import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 
    (import.meta.env.MODE === "development"
      ? "http://localhost:2000"
      : "https://sparkwave-backend-skvy.onrender.com"),
  withCredentials: false,
});

// ✅ Automatically attach token to request headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && error.response?.data?.code === "TOKEN_EXPIRED") {
      // Token expired, try to refresh
      try {
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL.replace('/api', '')}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const newToken = refreshResponse.data.accessToken;
        localStorage.setItem("token", newToken);
        
        // Retry the original request with new token
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api.request(error.config);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
