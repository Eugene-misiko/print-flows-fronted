import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"
// Auth Components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import AcceptInvitation from "./components/auth/AcceptInvitation";

//layout components
import Header from "./components/layout/Header";
function App() {

  return (
    <>

    <ToastContainer/>
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AcceptInvitation />} />
        <Route path="/header" element={<Header />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;