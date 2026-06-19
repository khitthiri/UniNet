import axios from "axios";

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
