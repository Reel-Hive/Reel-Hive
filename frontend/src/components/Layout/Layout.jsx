import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import "./Layout.css";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true); // Ensure it's open on large screens
      } else {
        setIsSidebarOpen(false); // Default to closed on small screens
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial state
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="layout-container">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="layout-content">
        <Sidebar isSidebarOpen={isSidebarOpen} isMobile={isMobile} />
        <div className={`layout-right ${isSidebarOpen && !isMobile ? "expanded" : "collapsed"}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
