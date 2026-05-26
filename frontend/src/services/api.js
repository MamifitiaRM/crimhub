import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: BASE_URL });

// Intercepteur request : ajouter token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("crimehub_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercepteur response : gérer 401
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      const code = err.response?.data?.code;
      if (code === "TOKEN_EXPIRED" || code === "INVALID_TOKEN") {
        localStorage.removeItem("crimehub_token");
        localStorage.removeItem("crimehub_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err.response?.data || { error: "Erreur réseau" });
  }
);

// ===== AUTH =====
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
};

// ===== USERS =====
export const usersAPI = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  ban: (id) => api.post(`/users/${id}/ban`),
  setBadge: (id, badge) => api.post(`/users/${id}/badge`, { badge }),
  getStats: () => api.get("/users/stats"),
  getLeaderboard: () => api.get("/users/leaderboard"),
};

// ===== EVENTS =====
export const eventsAPI = {
  create: (data) => api.post("/events", data),
  getAll: (params) => api.get("/events", { params }),
  getById: (id) => api.get(`/events/${id}`),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  join: (id) => api.post(`/events/${id}/join`),
  leave: (id) => api.post(`/events/${id}/leave`),
};

export default api;
