import React, { useContext, useEffect, useRef, useState } from "react";
import "./LoginSignup.css";
import user_icon from "/Assets/person.png";
import email_icon from "/Assets/email.png";
import { FaLock, FaUnlock } from "react-icons/fa";
import { UserContext } from "../userContext";
import API from "../axios";
import { useNavigate } from "react-router-dom";
import AuthPage from "./AuthPage";


const Signup = () => {
  useEffect(() => {
    document.body.classList.add("auth-page"); // Add class on mount
    return () => {
      document.body.classList.remove("auth-page"); // Remove class on unmount
    };
  }, []);

  const [avatar, setAvatar] = useState(null);
  const [cover, setCover] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [alert, setAlert] = useState({
    message: '',
    isOpen: false,
    redirectTo: null,
  });
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const { setUser } = useContext(UserContext);
  const navigate = useNavigate()


  const handleAvatarClick = () => {
    avatarInputRef.current.click();
  };

  const handleCoverClick = () => {
    coverInputRef.current.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file); // Save the atual file
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCover(file); // Save the atual file
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, username, email, password } = formData;
    const formDataToSend = new FormData();
    formDataToSend.append('name', name);
    formDataToSend.append('username', username);
    formDataToSend.append('email', email);
    formDataToSend.append('password', password);

    //  Append the file directly
    if (avatar) formDataToSend.append('avatar', avatar);
    if (cover) formDataToSend.append('coverImage', cover);

    try {
      const response = await API.post('/api/v1/users/signup', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUser(response.data.data.createdUser);
      navigate("/home");

      setAlert({
        message: 'Sign Up successfully',
        isOpen: true,
        redirectTo: '/home',
      });
    } catch (error) {
      setAlert({
        message: error.response?.data?.message || 'Something went wrong!',
        isOpen: true,
      });
    }
  }
  return (
    <div className="signup-container">
      <div className="ImageUploader">
        <div className="AvatarImage" onClick={handleAvatarClick}>
          {avatar ? (
            <img src={URL.createObjectURL(avatar)} alt="Avatar Preview" />
          ) : (
            <i className="bx bxs-camera"></i>
          )}
          <input
            type="file"
            ref={avatarInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="CoverImage" onClick={handleCoverClick}>
          {cover ? (
            <img src={URL.createObjectURL(cover)} alt="Cover Preview" />
          ) : (
            <>
              <i className="bx bxs-camera"></i>

              <span>Cover Image</span>
            </>
          )}
          <input
            type="file"
            ref={coverInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleCoverChange}
          />
        </div>
      </div>
      <div className="header">
        <div className="text">Sign Up</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        <div className="input">
          <img src={user_icon} alt="" />
          <input type="text" placeholder="Name" required name="name" value={formData.name} onChange={handleInputChange} />
        </div>
        <div className="input">
          <img src={user_icon} alt="" />
          <input type="text" placeholder="Username" name="username" value={formData.username} onChange={handleInputChange} required />
        </div>
        <div className="input">
          <img src={email_icon} alt="" />
          <input type="email" placeholder="Email Id" name="email" value={formData.email} onChange={handleInputChange} required />
        </div>
        <div className="input">
                 {/* Toggle Password Visibility Icon */}
                 <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                   {showPassword ? <FaUnlock size={20} /> : <FaLock size={20} />}
                 </span>
                 <input
                   type={showPassword ? "text" : "password"}
                   name="password"
                   value={formData.password}
                   onChange={handleInputChange}
                   placeholder="Password"
                   required
                 />
               </div>
        <button className="submit-button" onClick={handleSubmit}>Sign Up</button>
      </div>

      <div className="submit-container">
        <div className="submit" onClick={() => navigate("/")}>Login</div>
        <div className="submit gray">Sign Up</div>
      </div>
    </div>
  );
};


export default Signup;
