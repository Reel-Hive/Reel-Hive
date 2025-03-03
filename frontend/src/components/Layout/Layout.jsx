import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import "./Layout.css";

// const Layout = ({ children }) => {
  
//   return (
//    <div className="layout-container">
//     <Navbar />
//     <div className="layout-content">
//       <div className="layout-left">
//         <Sidebar />
//       </div>
//       <div className="layout-right">
//         {children}
//       </div>
//     </div>
//    </div>
//   );
// };

// const Layout = ({ children }) => {
//   // Set sidebar collapsed by default if screen width is <= 768px
//   const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsSidebarOpen(window.innerWidth > 768);
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const toggleSidebar = () => {
//     setIsSidebarOpen((prev) => !prev);
//   };

//   return (
//     <div className="layout-container">
//       <Navbar toggleSidebar={toggleSidebar} />
//       <div className="layout-content">
//         <Sidebar isSidebarOpen={isSidebarOpen} />
//         <div className={`layout-right ${isSidebarOpen ? "expanded" : "collapsed"}`}>
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// };

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
