import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./components/login"
import Register from "./components/registration"
import Home from "./components/Home"
import ItemOrderForm from "./components/ItemOrderForm"
import ItemOrderList from "./components/ItemOrderList"
import Layout from "./components/Layout"
import Profile from "./components/Profile"
import UserList from "./components/UserList"
import AdminOrders from "./components/AdminOrders"
import ClientOrder from "./components/ClientOrder"
import ClientOrders from "./components/ClientHistory"
import Products from "./components/Products"
import ProductDetail from "./components/ProductDetail"
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
         <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/list" element={<ItemOrderList />} />
          <Route path="/create" element={<ItemOrderForm />} />
          <Route path="/admin-orders" element={<AdminOrders />}/>
          <Route path="/client-orders/:product?Id?" element={<ClientOrder/>}/>
          <Route path="/create-order/:productId?" element={<ClientOrder />} />
          <Route path="/history" element={<ClientOrders/>}/>
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App