import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import store from "./store/store.js";
import Layout from "./components/layout/Layout";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import AcceptInvitation from "./components/auth/AcceptInvitation";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import AdminDashboard from "./pages/admin/Dashboard";
import DesignerDashboard from "./pages/designer/Dashboard";
import PrinterDashboard from "./pages/printer/Dashboard";
import ClientDashboard from "./pages/client/Dashboard";
import OrdersList from "./pages/OrdersList";
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
import UserRegister from "./components/auth/userRegister.jsx";
// Dashboard router based on user role
// Roles are LOWERCASE: 'admin', 'designer', 'printer', 'client', 'platform_admin'
const DashboardRouter = () => {
  const user = useSelector((state) => state.auth.user);

  if (!user) return null;
  
  switch (user.role) {
    case "admin":
    case "platform_admin":
      return <AdminDashboard />;
    case "designer":
      return <DesignerDashboard />;
    case "printer":
      return <PrinterDashboard />;
    case "client":
    default:
      return <ClientDashboard />;
  }
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} /> 
          <Route path="/register-company" element={<Register />} />
          <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />
          <Route path="/register" element={<UserRegister />} />
          
          <Route path="/mobile" element={<MobileSidebar/>}/>
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardRouter />} />
            <Route path="orders" element={<OrdersList />} />          
            <Route path="orders/new" element={<CreateOrder />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="users" element={ 
              <ProtectedRoute allowedRoles={["admin"]}> 
              <UsersList />
            </ProtectedRoute>}/>
            <Route path="products" element={<ProductsList />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="notifications" element={<NotificationsList />} />
          </Route>
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
