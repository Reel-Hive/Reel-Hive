// import React, { useState, useEffect } from "react";
// import './LoginSignup.css'
// import user_icon from '/Assets/person.png';
// import email_icon from '/Assets/email.png';
// import password_icon from '/Assets/password.png';
// import profile_icon from '/Assets/profile.png';
// import axios from "axios";



// const LoginSignup = () => {

//   const [action, setAction] = useState("Sign Up");

//   useEffect(() => {
//     document.body.classList.add("login-signup-page");

//     return () => {
//       document.body.classList.remove("login-signup-page");
//     };
//   }, []);

//   return (
//     <div className="container">

//       <div className="header">
//         <div className="text">{action}</div>
//         <div className="underline"></div>
//       </div>
//       <div className="inputs">
//         {action === "Login" ? <div></div> : <div className="input">
//           <img src={user_icon} alt="" />
//           <input type="text" placeholder="Name" required />
//         </div>}
//         {action === "Login" ? <div></div> : <div className="input">
//           <img src={user_icon} alt="" />
//           <input type="text" placeholder=" User Name" required />
//         </div>}
//         <div className="input">
//           <img src={email_icon} alt="" />
//           <input type="email" placeholder="Email Id" />
//         </div>
//         <div className="input">
//           <img src={password_icon} alt="" />
//           <input type="password" placeholder="Password" />
//         </div>
//         <button className="submit-button">Submit</button>
//       </div>
//       {action === "Sign Up" ? <div></div> : <div className="forget-password">Forget Password? <a href="#">Click here!</a></div>}

//       <div className="submit-container">
//         <div className={action === "Login" ? "submit gray" : "submit"} onClick={() => { setAction("Sign Up") }}>Sign Up</div>
//         <div className={action === "Sign Up" ? "submit gray" : "submit"} onClick={() => { setAction("Login") }}>Login</div>
//       </div>
//     </div>
//   );
// };


// export default LoginSignup;

import React, { useContext, useEffect, useState } from "react";
import email_icon from "/Assets/email.png";
import password_icon from "/Assets/password.png";
import API from "../axios";
import { UserContext } from "../userContext";
import { useNavigate } from "react-router-dom";


const Login = ({ switchToSignup }) => {
  const navigate = useNavigate();
  useEffect(() => {
    document.body.classList.add("auth-page"); // Add class on mount
    return () => {
      document.body.classList.remove("auth-page"); // Remove class on unmount
    };
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState({
    message: '',
    isOpen: false,
    redirectTo: null,
  });

  const { setUser } = useContext(UserContext);

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await API.post(
        "/api/v1/users/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );
  
      console.log("Login Response:", response.data); // Debugging
  
      // Correct way to access user data
      if (response.data.data && response.data.data.loggedUser) {
        setUser(response.data.data.loggedUser);
        navigate("/home");
      } else {
        console.error("No user data received:", response.data);
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data?.message || error.message);
    }
  };
  

  return (
    <div className="login-container">
      <div className="header">
        <div className="text">Login</div>
        <div className="underline"></div>
      </div>

      <div className="inputs">
        <div className="input">
          <img src={email_icon} alt="" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Id" required />
        </div>
        <div className="input">
          <img src={password_icon} alt="" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        </div>
        <button className="submit-button" onClick={handleLogin}>Login</button>
      </div>

      <div className="forget-password">
        Don't have an account? <a href="/signup">Click here!</a>
      </div>

      <div className="submit-container">
        <div className="submit gray">Login</div>
        <div className="submit" onClick={switchToSignup}>Sign Up</div>
      </div>
    </div>
  );
};

export default Login;
