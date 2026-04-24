import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import store from "./store/store";
import { fetchProfile } from "./store/slices/authSlice";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
// AUTH
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import AcceptInvitation from "./components/auth/AcceptInvitation";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
// DASHBOARDS
import AdminDashboard from "./pages/admin/Dashboard";
import DesignerDashboard from "./pages/designer/Dashboard";
import PrinterDashboard from "./pages/printer/Dashboard";
import ClientDashboard from "./pages/client/Dashboard";
import PlatformDashboard from "./pages/platform/PlatformDashboard";
// PAGES
import OrdersList from "./pages/OrdersList";
import LandingPage from "./pages/LandingPage";
import OrderDetail from "./pages/OrderDetail";
import CreateOrder from "./pages/CreateOrder";
import UsersList from "./pages/UsersList";
import ProductsList from "./pages/ProductsList";
import PaymentsPage from "./pages/PaymentsPage";
import InvoicesPage from "./pages/InvoicesPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import MessagesPage from "./pages/MessagesPage";
import NotificationsList from "./pages/NotificationsList";
import MobileSidebar from "./components/layout/MobileSidebar";
import UserRegister from "./components/auth/userRegister";
import StoreHome from "./publicitems/StoreHome";
import ProductDetail from "./publicitems/ProductDetail";
import CategoryPage from "./publicitems/CategoryPage";
import CompanyHome from "./components/CompanyHome";
import ReceiptsPage from "./pages/Receiptspage";

// DASHBOARD ROUTER 
const DashboardRouter = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <div>Loading...</div>;

  switch (user.role) {
    case "platform_admin":
      return <PlatformDashboard />;
    case "admin":
      return <AdminDashboard />;
    case "designer":
      return <DesignerDashboard />;
    case "printer":
      return <PrinterDashboard />;
    default:
      return <ClientDashboard />;
  }
};

// APP CONTENT
const AppContent = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

useEffect(() => {
  const token = localStorage.getItem("access_token");
  //  DO NOT fetch profile on invitation registration page
  const isRegisterPage = window.location.pathname.includes("register-company");

  if (token && !isRegisterPage) {
    dispatch(fetchProfile());
  }
}, [dispatch]);

  return (
    <>
   
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/company/:slug/store" element={<StoreHome />} />
        <Route path="/company/:slug" element={<CompanyHome />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/company/:slug/product/:id" element={<ProductDetail />} />
        <Route path="/company/:slug/category/:id" element={<CategoryPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/:company/platform/register-company" element={<Register />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="accept-invitation/:token"  element={<AcceptInvitation />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/mobile" element={<MobileSidebar />} />
        {/* PROTECTED ROUTES */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardRouter />} />
          <Route path="orders" element={<OrdersList />} />
          <Route path="orders/new" element={<CreateOrder />} />
          <Route path="orders/:id" element={<OrderDetail />} />

          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={["admin", "platform_admin"]}>
                <UsersList />
              </ProtectedRoute>
            }
          />

          <Route path="products" element={<ProductsList />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="receipts" element={<ReceiptsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="notifications" element={<NotificationsList />} />
        </Route>
        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};
// MAIN APP
function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;