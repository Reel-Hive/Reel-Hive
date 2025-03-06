import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import './Sidebar.css';
import home from '/Assets/home.png';
import subscription from '/Assets/subscription.png';
import history from '/Assets/history.png';
import like_video from '/Assets/like.png';
import your_video from '/Assets/your_video.png';

const Sidebar = ({ isSidebarOpen }) => {
    return (
        <div className={`sidebar-container ${isSidebarOpen ? "open" : "collapsed"}`}>
            <div className="sidebar-content">
                <div className="sidebar-navlinks">
                    <ul>
                        <li>
                            <Link to="/Home">
                                <img src={home} alt="Home" />
                                {isSidebarOpen && <span>Home</span>}
                            </Link>
                        </li>
                        <li>
                            <Link to="/Subscription">
                                <img src={subscription} alt="Subscription" />
                                {isSidebarOpen && <span>Subscription</span>}
                            </Link>
                        </li>
                        <li>
                            <Link to="/History">
                                <img src={history} alt="History" />
                                {isSidebarOpen && <span>History</span>}
                            </Link>
                        </li>
                        <li>
                            <Link to="/liked-videos">
                                <img src={like_video} alt="Liked Videos" />
                                {isSidebarOpen && <span>Liked Videos</span>}
                            </Link>
                        </li>
                        <li>
                            <Link to="/your-videos">
                                <img src={your_video} alt="Your Videos" />
                                {isSidebarOpen && <span>Your Videos</span>}
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
