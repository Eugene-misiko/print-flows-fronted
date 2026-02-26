import { useState } from 'react'
import Login from './components/login'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Register from './components/registration'
import Home from './components/Home'
function App() {


  return (
    <>
  <Router>
    <Routes>

      <Route path='/home' element={<Home/>}/>
      <Route path='/register' element={<Register/>}/>
      <Route path='/login' element={<Login/>}/>
    </Routes>
  </Router>
   
   
   
    </>
  )
}

export default App
