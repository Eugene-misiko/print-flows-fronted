import axios from "axios";
import { jwtDecode } from "jwt-decode";

// BASE AXIOS INSTANCE
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const publicAPI = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// TOKEN HELPERS
const getAccessToken = () => localStorage.getItem("access_token");
const getRefreshToken = () => localStorage.getItem("refresh_token");

const setAccessToken = (token) => {
  localStorage.setItem("access_token", token);
};

const clearAuth = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  window.location.replace("/login");
};

// CHECK TOKEN EXPIRY
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// REFRESH STATE
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// GET COMPANY SLUG FROM URL
const getCompanySlugFromURL = () => {
  const path = window.location.pathname;
  const match = path.match(/\/store\/([^/]+)/);
  return match ? match[1] : null;
};

// REQUEST INTERCEPTOR
api.interceptors.request.use(async (config) => {
  let token = getAccessToken();

  // TOKEN REFRESH LOGIC
  if (token && isTokenExpired(token)) {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearAuth();
      return config;
    }

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh/`,
          { refresh: refreshToken }
        );

        token = response.data.access;
        setAccessToken(token);

        onRefreshed(token);
      } catch (err) {
        clearAuth();
      } finally {
        isRefreshing = false;
      }
    }

    return new Promise((resolve) => {
      subscribeTokenRefresh((newToken) => {
        config.headers.Authorization = `Bearer ${newToken}`;
        resolve(config);
      });
    });
  }

  // ATTACH TOKEN
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// RESPONSE INTERCEPTOR (RETRY ON 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh/")
    ) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearAuth();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh/`,
          { refresh: refreshToken }
        );

        const newAccess = response.data.access;
        setAccessToken(newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return api(originalRequest);
      } catch (err) {
        clearAuth();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);
export { publicAPI };
export default api;

// ===================== AUTH =====================
// Roles are LOWERCASE: 'admin', 'designer', 'printer', 'client', 'platform_admin'
export const authAPI = {
  login: (data) => api.post("/auth/login/", data),
  getMe: () => api.get("/auth/me/"),
  registerUser: (data) => api.post("/auth/register-user/", data),
  logout: () => api.post("/auth/logout/", {refresh_token: localStorage.getItem("refresh_token"),}),
  register: (data) => api.post("/auth/register/", data), 
  registerCompany: (data) => api.post("/auth/register-company/", data),
  getProfile: () => api.get("/auth/profile/"),
  updateProfile: (data) => api.patch("/auth/profile/", data),
  changePassword: (data) => api.post("/auth/change-password/", data),
  requestPasswordReset: (email) => api.post("/auth/password-reset/", { email }),
  confirmPasswordReset: (data) => api.post("/auth/password-reset/confirm/", data),
};

// ===================== USERS =====================
export const usersAPI = {
  getAll: (params) => api.get("/users/", { params }),
  getById: (id) => api.get(`/users/${id}/`),
  update: (id, data) => api.patch(`/users/${id}/`, data),
  deactivate: (id) => api.post(`/users/${id}/deactivate/`),
  changeRole: (id, role) => api.post(`/users/${id}/change-role/`, { role }),
};

// ===================== INVITATIONS =====================
export const invitationsAPI = {
  getAll: () => api.get("/invitations/"),
  getByToken: (token) => api.get(`/invitations/${token}/`),
  create: (data) => api.post("/invitations/", data),
  cancel: (token) => api.post(`/invitations/${token}/cancel/`),
  resend: (token) => api.post(`/invitations/${token}/resend/`),
};

// ===================== COMPANY =====================
export const companyAPI = {
  getBySlug: (slug) => api.get(`/companies/by-slug/${slug}/`),
  get: () => api.get("/company/"),
  getCompanies: () => api.get("/companies/"),
  update: (data) => api.patch("/company/update/", data),
  getSettings: () => api.get("/company/settings/"),
  updateSettings: (data) => api.patch("/company/settings/", data),
  getPaymentSettings: () => api.get("/company/payment-settings/"),
  updatePaymentSettings: (data) => api.patch("/company/payment-settings/", data),
  getDashboard: () => api.get("/company/dashboard/"),
  getStaff: () => api.get("/company/staff/"),
  getStaffStats: () => api.get("/company/staff/stats/"),
};
// ===================== COMPANY INVITATIONS =====================
export const companyInvitationsAPI = {
  // Platform admin sends invite
  create: (data) => api.post("/company/invitations/", data),
  // Validate company invite token
  getByToken: (token) => publicAPI.get(`/company-invitations/${token}/`)
};

// ===================== CATEGORIES =====================
export const categoriesAPI = {
  getAll: () => api.get("/categories/"),
  getById: (id) => api.get(`/categories/${id}/`),
  create: (data) => api.post("/categories/create/", data),
  update: (id, data) => api.patch(`/categories/${id}/update/`, data),
  delete: (id) => api.delete(`/categories/${id}/delete/`),
};

// ===================== PRODUCTS =====================
export const productsAPI = {
  getAll: (params) => api.get("/products/", { params }),
  getFeatured: () => api.get("/products/featured/"),
  getById: (id) => api.get(`/products/${id}/`),
  create: (data) => api.post("/products/create/", data),
  update: (id, data) => api.put(`/products/${id}/`, data),
  delete: (id) => api.delete(`/products/${id}/delete/`),
  getPublic: () => api.get("/public/products/"),
  getPublicCategories: () => api.get("/public/categories/"),
  getPublicById: (id) => api.get(`/public/products/${id}/`),
  getPublicCategoryById: (id) => api.get(`/public/categories/${id}/`),
  };

// ===================== ORDERS =====================
// Status values are LOWERCASE: 'pending', 'assigned_to_designer', 'design_in_progress', etc.
export const ordersAPI = {
  getAll: (params) => api.get("/orders/", { params }),
  getById: (id) => api.get(`/orders/${id}/`),
  create: (data) => api.post("/orders/", data),
  update: (id, data) => api.patch(`/orders/${id}/`, data),
  delete: (id) => api.delete(`/orders/${id}/`),
  
  // Workflow - uses designer_id and printer_id
  assignDesigner: (id, designerId) => api.post(`/orders/${id}/assign-designer/`, { designer_id: designerId }),
  assignPrinter: (id, printerId) => api.post(`/orders/${id}/assign-printer/`, { printer_id: printerId }),
  startDesign: (id) => api.post(`/orders/${id}/start-design/`),
  submitDesign: (id, data) => api.post(`/orders/${id}/submit-design/`, data),
  approveDesign: (id, approved, rejectionReason) => api.post(`/orders/${id}/approve-design/`, { approved, rejection_reason: rejectionReason }),
  cancel: (id, reason) => api.post(`/orders/${id}/cancel/`, { reason }),
  
  // Dashboard
  getMyOrders: () => api.get("/my-orders/"),
  getMyAssignments: () => api.get("/my-assignments/"),
  getMyPrintJobs: () => api.get("/my-print-jobs/"),
  getUnassigned: () => api.get("/unassigned/"),
};

// ===================== PRINT JOBS =====================
export const printJobsAPI = {
  getAll: (params) => api.get("/print-jobs/", { params }),
  getById: (id) => api.get(`/print-jobs/${id}/`),
  start: (id) => api.post(`/print-jobs/${id}/start/`),
  moveToPolishing: (id) => api.post(`/print-jobs/${id}/polishing/`),
  complete: (id) => api.post(`/print-jobs/${id}/complete/`),
};

// ===================== TRANSPORTATION =====================
export const transportationAPI = {
  getAll: (params) => api.get("/transportation/", { params }),
  getById: (id) => api.get(`/transportation/${id}/`),
};

// ===================== INVOICES =====================
export const invoicesAPI = {
  getAll: (params) => api.get("/invoices/", { params }),
  getById: (id) => api.get(`/invoices/${id}/`),
  download: (id) => api.get(`/invoices/${id}/download/`, { responseType: "blob" }),
  send: (id) => api.post(`/invoices/${id}/send/`),
  getPendingDeposit: () => api.get("/invoices/pending-deposit/"),
  getPendingBalance: () => api.get("/invoices/pending-balance/"),
};

// ===================== PAYMENTS =====================
export const paymentsAPI = {
  getAll: (params) => api.get("/payments/", { params }),
  getById: (id) => api.get(`/payments/${id}/`),
  // Required: invoice_id, amount, payment_type ('deposit'|'balance'|'full'), payment_method ('mpesa'|'cash'|'card')
  record: (data) => api.post("/record-payment/", data),
  getStats: () => api.get("/payment-stats/"),
};

// ===================== MPESA =====================
// Phone must be format: 2547XXXXXXXX
export const mpesaAPI = {
  // Required: invoice_id, phone_number
  stkPush: (data) => api.post("/mpesa/stk-push/", data),
};

// ===================== RECEIPTS =====================
export const receiptsAPI = {
  getAll: (params) => api.get("/receipts/", { params }),
  getById: (id) => api.get(`/receipts/${id}/`),
  download: (id) => api.get(`/receipts/${id}/download/`, { responseType: "blob" }),
};

// ===================== NOTIFICATIONS =====================
export const notificationsAPI = {
  getAll: (params) => api.get("/notifications/", { params }),
  getById: (id) => api.get(`/notifications/${id}/`),
  markAsRead: (id) => api.post(`/notifications/${id}/mark-read/`),
  markAllAsRead: () => api.post("/notifications/mark-all-read/"),
  getUnreadCount: () => api.get("/notifications/unread-count/"),
};

// ===================== CONVERSATIONS =====================
export const conversationsAPI = {
  getAll: () => api.get("/conversations/"),
  getById: (id) => api.get(`/conversations/${id}/`),
  create: (data) => api.post("/conversations/", data),
  update: (id, data) => api.patch(`/conversations/${id}/`, data),
  delete: (id) => api.delete(`/conversations/${id}/`),
  getMessages: (id, params) => api.get(`/conversations/${id}/messages/`, { params }),
  setTyping: (id, isTyping) => api.post(`/conversations/${id}/typing/`, { is_typing: isTyping }),
  start: (data) => api.post("/start-conversation/", data),
};

// ===================== MESSAGES =====================
export const messagesAPI = {
  getAll: (params) => api.get("/messages/", { params }),
  getById: (id) => api.get(`/messages/${id}/`),
  send: (data) => api.post("/messages/", data),
};

// ===================== MESSAGING =====================
export const messagingAPI = {
  getUnread: () => api.get("/unread/"),
};