import axios from "axios";

// In production set VITE_API_URL to your deployed API (e.g. https://uninet-api.onrender.com).
// In development the Vite proxy forwards /api to localhost:5000.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("uninet_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("uninet_token");
      if (!["/login","/welcome","/register"].includes(window.location.pathname)) window.location.href = "/welcome";
    }
    return Promise.reject(err);
  }
);

export default api;
