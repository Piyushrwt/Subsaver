import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const gmailApi = axios.create({ baseURL: `${API_BASE_URL}/api/gmail` });

gmailApi.interceptors.request.use(cfg => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default gmailApi; 