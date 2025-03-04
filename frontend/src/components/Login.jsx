import React, { useContext, useEffect, useState } from "react";
import email_icon from "/Assets/email.png";
import { FaLock, FaUnlock } from "react-icons/fa";
import API from "../axios";
import { UserContext } from "../userContext";
import { useNavigate } from "react-router-dom";


const Login = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.body.classList.add("auth-page"); // Add class on mount
    return () => {
      document.body.classList.remove("auth-page"); // Remove class on unmount
    };
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
          {/* Toggle Password Visibility Icon */}
          <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaUnlock size={20} /> : <FaLock size={20} />}
          </span>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>

        <button className="submit-button" onClick={handleLogin}>Login</button>
      </div>

      <div className="forget-password">
        Don't have an account? <a href="/signup">Click here!</a>
      </div>

      <div className="submit-container">
        <div className="submit gray">Login</div>
        <div className="submit" onClick={() => navigate("/signup")}>Sign Up</div>
      </div>
    </div>
  );
};

export default Login;
