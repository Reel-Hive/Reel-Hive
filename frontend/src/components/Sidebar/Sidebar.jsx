import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import './Sidebar.css';
import home from '/Assets/home.png';
import subscription from '/Assets/subscription.png';
import history from '/Assets/history.png';
import like_video from '/Assets/like.png';
import your_video from '/Assets/video.png';

const Sidebar = ({ isSidebarOpen }) => {
    return (
        <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
            <div className="sortcut-links">
                <div className="side-links">
                    <Link to="/home">
                        <img src={home} alt="Home" />
                        <p>Home</p>
                    </Link>
                </div>
                <div className="side-links">
                    <Link to="/subscription">
                        <img src={subscription} alt="Subscription" />
                        <p>Subscription</p>
                    </Link>
                </div>
                <div className="side-links">
                    <Link to="/history">
                        <img src={history} alt="History" />
                        <p>History</p>
                    </Link>
                </div>
                <div className="side-links">
                    <Link to="/liked-videos">
                        <img src={like_video} alt="Liked Videos" />
                        <p>Liked Videos</p>
                    </Link>
                </div>
                <div className="side-links">
                    <Link to="/your-videos">
                        <img src={your_video} alt="Your Videos" />
                        <p>Your Videos</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
