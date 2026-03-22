import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"
// Auth Components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import AcceptInvitation from "./components/auth/AcceptInvitation";
//users dashboards
import AdminDashboard from "./pages/admin/Dashboard";
//layout 
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {

  return (
    <>

    <ToastContainer/>
    <Router>
      <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/accept-invitation" element={<AcceptInvitation />} />
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>}>
          </Route>
      </Routes>
    </Router>
    </>
  );
}

export default App;