import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./components/login";
import Register from "./components/registration";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Profile from "./components/Profile";
import UserList from "./components/UserList";
import ClientOrder from "./components/ClientOrder";
import ClientOrders from "./components/ClientHistory";
import Products from "./components/Products";
import ProductDetail from "./components/ProductDetail";
import PrinterDashboard from "./components/PrinterDashboard";
import DesignerDashboard from "./components/DesignerDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./components/Landing";
import InvoicePage from "./components/InvoicePage";
import PaymentPage from "./components/PaymentPage";

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Landing />} />
        <Route path="/InvoicePage/:id" element={<InvoicePage />} />
        <Route path="/invoice/:id" element={<InvoicePage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/:id" element={<PaymentPage />} />
        
        <Route element={<Layout />}>
          <Route
            path="/authen"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <Home />
              </ProtectedRoute>}/>

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

          <Route
            path="/create-order/:productId?"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientOrder />
              </ProtectedRoute>}/>
          <Route
            path="/history"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientOrders />
              </ProtectedRoute>}/>
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserList />
              </ProtectedRoute>}/>
          <Route
            path="/designer"
            element={
              <ProtectedRoute allowedRoles={["designer"]}>
                <DesignerDashboard />
              </ProtectedRoute>}/>
          {/* PRINTER ROUTES */}
          <Route
            path="/printer"
            element={
              <ProtectedRoute allowedRoles={["printer"]}>
                <PrinterDashboard />
              </ProtectedRoute> }/>

          {/* COMMON */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["client", "admin", "designer", "printer"]}>
                <Profile />
              </ProtectedRoute> }/>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;