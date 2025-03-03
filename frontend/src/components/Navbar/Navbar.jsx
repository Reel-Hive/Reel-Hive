import React, { useContext, useEffect, useState } from "react";
import './Navbar.css';
import menu_icon from '/Assets/menu.png';
import logo from '/Assets/logo_2.png';
import search_icon from '/Assets/search.png';
import create_icon from '/Assets/create.png';
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../userContext";
import API from "../../axios";


const Navbar = ({ toggleSidebar }) => {

    useEffect(() => {
        document.body.classList.add("loaded");
    }, []);

    const [isUserInfoVisible, setIsUserInfoVisible] = useState(false);
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const toggleUserInfo = () => {
        setIsUserInfoVisible(!isUserInfoVisible);
    };

    const handleLogout = async () => {
        try {
            // Call the logout api end point
            const response = await API.post('/api/v1/users/logout');
            setUser(null);
            navigate('/');
        } catch (error) {
            console.error(error);
        }
    };

    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen((prev) => !prev);
    };

    const toggleCreateDropdown = () => {
        setIsCreateDropdownOpen((prev) => !prev);
    };

    const [query, setQuery] = useState('');
    const handleSearch = () => {
        if (query.trim()) {
            navigate(`/search?query=${query}`);
        }
    };

    const handleKeyEnter = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };
    return (
        <nav className="flex-div">
            <div className="nav-left flex-div">
                {/* Menu Icon with Toggle Functionality */}
                <img
                    className="menu-icon"
                    src={menu_icon}
                    alt="Menu"
                    onClick={toggleSidebar}
                />
                <img className="logo" src={logo} alt="Logo" />
                <p>ReelHive</p>
            </div>
            <div className="nav-middle flex-div">
                <div className="search-box flex-div">
                    <input type="text"
                        placeholder="Search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyEnter} />
                    <img src={search_icon} alt="Search" />
                </div>
            </div>
            <div className="nav-right flex-div">
                {/* Create Icon with Dropdown */}
                <div className="create-dropdown">
                    <img
                        className="create-icon"
                        src={create_icon}
                        alt="Create"
                        onClick={toggleCreateDropdown}
                    />
                    <p onClick={toggleCreateDropdown}>Create</p>
                    {isCreateDropdownOpen && (
                        <div className="dropdown-menu">
                            <ul>
                                <a href="./publish-video">Publish video</a>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Profile Icon with Dropdown */}
                <div className="profile-dropdown" onClick={toggleUserInfo}>
                    <img
                        src={user?.avatar || '/images/user.svg'}
                        className="profile-image"
                        alt="User Avatar"
                        onClick={toggleProfileDropdown}
                    />

                    {isProfileDropdownOpen && (
                        <div className="dropdown-menu">
                            {isUserInfoVisible && (<ul>
                                <a href="./your-Videos">Profile</a>
                                <li onClick={handleLogout} className="signOut">Sign Out</li>
                                <a href="./settings">Setting</a>
                            </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
