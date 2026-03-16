import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "./components/Login";
import Register from "./components/Registration";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Profile from "./components/Profile";
import UserList from "./components/UserList";
import ClientOrder from "./components/ClientOrder";
import ClientOrders from "./components/ClientHistory";
import Products from "./components/Products";
import ProductDetail from "./components/ProductDetail";
import PrinterDashboard from "./components/PrinterDashboard";
import DesignerDashboard from "./components/DesignerDashboard";
import InvoicePage from "./components/InvoicePage";
import PaymentPage from "./components/PaymentPage";
import Landing from "./components/Landing";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/invoice/:id" element={<InvoicePage />} />
        <Route path="/payment/:id" element={<PaymentPage />} />
        {/* PROTECTED ROUTES */}
        <Route element={<Layout />}>
          {/* CLIENT DASHBOARD */}
          <Route
            path="/authen"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <Home />
              </ProtectedRoute>}/>
          {/* PRODUCTS */}
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <Products />
              </ProtectedRoute>}/>
          <Route
            path="/products/:id"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ProductDetail />
              </ProtectedRoute>}/>
          {/* CREATE ORDER */}
          <Route
            path="/create-order/:productId?"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientOrder />
              </ProtectedRoute>}/>
          {/* ORDER HISTORY */}
          <Route
            path="/history"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientOrders />
              </ProtectedRoute>}/>
          {/* ADMIN */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserList />
              </ProtectedRoute>}/>
          {/* DESIGNER DASHBOARD */}
          <Route
            path="/designer"
            element={
              <ProtectedRoute allowedRoles={["designer"]}>
                <DesignerDashboard />
              </ProtectedRoute>}/>
          {/* PRINTER DASHBOARD */}
          <Route
            path="/printer"
            element={
              <ProtectedRoute allowedRoles={["printer"]}>
                <PrinterDashboard />
              </ProtectedRoute>}/>
          {/* COMMON PROFILE */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["client","admin","designer","printer"]}>
                <Profile />
              </ProtectedRoute>}/>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;