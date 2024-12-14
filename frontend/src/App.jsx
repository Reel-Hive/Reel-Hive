import React from 'react'
import LoginSignup from './components/Login-Signup/LoginSignup'
import Navbar from './components/Navbar/Navbar'

import { Routes, BrowserRouter, Route } from 'react-router-dom'


function App() {


  return (
    <div>
      <BrowserRouter>
<LoginSignup/>
      <Routes>
        <Route path= "/nav" element= {<Navbar/>}/>
      </Routes>
       </BrowserRouter>

    </div>
  )
}

export default App
