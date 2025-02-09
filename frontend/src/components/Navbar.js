import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/Navbar.css"; // Import the CSS file

const Navbar = ({ userId, handleLogout }) => {
    return (
        <nav className="navbar">
            <h1>SkillAlchemy</h1>
            <ul>
                {userId ? (
                    <>
                        <li><Link to="/home">Home</Link></li>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/profile">Profile</Link></li>
                        <li><Link to="/login" onClick={handleLogout}>Logout</Link></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/signup">Register</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
