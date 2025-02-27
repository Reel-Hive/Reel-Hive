import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import "./Layout.css";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768); // Sidebar open by default on large screens

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true); // Show sidebar on large screens
      } else {
        setIsSidebarOpen(false); // Hide sidebar on small screens
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="layout">
      {/* Navbar with toggle functionality */}
      <Navbar toggleSidebar={toggleSidebar} />

      <div className="main-layout">
        {/* Sidebar */}
        <Sidebar isSidebarOpen={isSidebarOpen} />

        {/* Main content area */}
        <div className={`content ${isSidebarOpen ? "sidebar-open" : ""}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
