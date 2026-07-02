import axios from "axios";
import Cookies from "js-cookie";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: 10000,
  withCredentials: true,
});

// ==========================================
// 🛡️ Request Interceptor (Backup Layer)
// ==========================================
API.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ==========================================
// 💥 Response Interceptor (Error Global handling)
// ==========================================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn(
        "⚠️ Session expired or invalid. Clearing browser state context.",
      );
      Cookies.remove("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);

export default API;
