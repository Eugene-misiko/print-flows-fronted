import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login/", credentials),
  register: (data) => api.post("/auth/register/", data),
  logout: () => api.post("/auth/logout/"),
  getProfile: () => api.get("/auth/profile/"),
  updateProfile: (data) => api.patch("/auth/profile/", data),
  changePassword: (data) => api.post("/auth/change-password/", data),
  forgotPassword: (email) => api.post("/auth/forgot-password/", { email }),
  resetPassword: (data) => api.post("/auth/reset-password/", data),
  acceptInvitation: (data) => api.post("/auth/accept-invitation/", data),
};

// Company API
export const companyAPI = {
  getCompany: () => api.get("/companies/my-company/"),
  updateCompany: (data) => api.patch("/companies/my-company/", data),
  getSettings: () => api.get("/companies/settings/"),
  updateSettings: (data) => api.patch("/companies/settings/", data),
  inviteUser: (data) => api.post("/companies/invite/", data),
  getInvitations: () => api.get("/companies/invitations/"),
  cancelInvitation: (id) => api.delete(`/companies/invitations/${id}/`),
  getDashboard: () => api.get("/companies/dashboard/"),
};

// Users API
export const usersAPI = {
  getUsers: (params) => api.get("/accounts/users/", { params }),
  getUser: (id) => api.get(`/accounts/users/${id}/`),
  updateUser: (id, data) => api.patch(`/accounts/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/accounts/users/${id}/`),
  getDesigners: () => api.get("/accounts/users/", { params: { role: "DESIGNER" } }),
  getPrinters: () => api.get("/accounts/users/", { params: { role: "PRINTER" } }),
  getClients: () => api.get("/accounts/users/", { params: { role: "CLIENT" } }),
};