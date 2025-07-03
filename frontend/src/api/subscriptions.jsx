import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const api = axios.create({ baseURL: `${API_BASE_URL}/api/subscriptions` });
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const getSubscriptions   = ()   => api.get("/").then(r => r.data);
export const addSubscription    = (b)  => api.post("/", b);
export const deleteSubscription = (id) => api.delete(`/${id}`);
export const getStats = () => api.get("/")
  .then(r => {
    const subs = r.data;
    const monthly = subs.reduce((a, s) => a + (s.billingCycle === "monthly" ? s.amount : 0), 0);
    const yearly  = subs.reduce((a, s) => a + (s.billingCycle === "yearly"  ? s.amount : 0), 0);
    const upcoming = subs.filter(s => {
      const diff = (new Date(s.renewalDate) - Date.now()) / 86400000;
      return diff >= 0 && diff <= 30;
    }).length;
    return { monthly, yearly, upcoming };
  });
