import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const api = axios.create({ baseURL: `${API_BASE_URL}/api/auth` });

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const register = (f) => api.post("/register", f).then(r => r.data);

export const login = (f) => api.post("/login", f).then(r => r.data);

export default api;
