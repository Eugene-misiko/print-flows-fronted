import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./components/login"
import Register from "./components/registration"
import Home from "./components/Home"
import ItemOrderForm from "./components/ItemOrderForm"
import ItemOrderList from "./components/ItemOrderList"
import Layout from "./components/Layout"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/list" element={<ItemOrderList />} />
          <Route path="/create" element={<ItemOrderForm />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App