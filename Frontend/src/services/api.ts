import axios from "axios";

// In production the frontend points to the deployed backend.
// Use Vite env `VITE_API_URL` (e.g. https://interviewai-backend-project.onrender.com)
// If `VITE_API_URL` is provided we append `/api` so api.post("/auth/register") -> <BACKEND>/api/auth/register
const RAW_API = (import.meta.env.VITE_API_URL as string) || "";
const BASE_URL = RAW_API
  ? (RAW_API.endsWith("/") ? RAW_API.slice(0, -1) : RAW_API) + "/api"
  : "/api";

// Creates a centralized axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // IMPORTANT: Allows passing HttpOnly JWT cookies!
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 ||
        (error.response.status === 400 && error.response.data?.message?.toLowerCase().includes("token")))
    ) {
      console.warn("Unauthorized access! The JWT might be expired or missing.");
      const currentHash = (window.location.hash || "").toLowerCase();
      const isAuthPage =
        currentHash.includes("login") ||
        currentHash.includes("register") ||
        currentHash === "" ||
        currentHash === "#" ||
        currentHash === "#/";

      if (!isAuthPage && error.config?.url !== "/auth/me") {
        window.location.hash = "#/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
