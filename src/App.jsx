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
import AddProduct from "./components/AddProduct";
import EditProduct from "./components/EditProduct";
import OrderDetail from "./components/OrderDetail";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"
function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <>

    <ToastContainer/>
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/invoice/:id" element={<InvoicePage />} />
        <Route path="/payment/:id" element={<PaymentPage />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        {/* PROTECTED ROUTES */}
        <Route element={<Layout />}>
          {/* CLIENT DASHBOARD */}
          <Route
            path="/authen"
            element={
              <ProtectedRoute allowedRoles={["client","admin",]}>
                <Home />
              </ProtectedRoute>}/>
          {/* PRODUCTS */}
          <Route
            path="/products/new"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddProduct />
              </ProtectedRoute>}/>
          <Route
            path="/products/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EditProduct />
              </ProtectedRoute>}/>
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={["client","admin"]}>
                <Products />
              </ProtectedRoute>}/>
          <Route
            path="/products/:id"
            element={
              <ProtectedRoute allowedRoles={["client", "admin"]}>
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
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["client","admin","designer","printer"]}>
                <Profile />
              </ProtectedRoute>}/>
        </Route>
      </Routes>
    </Router>
    </>
  );
}

export default App;