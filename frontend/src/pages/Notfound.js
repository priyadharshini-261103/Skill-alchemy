import React from "react";
import { Link } from "react-router-dom";
import "../styles/NotFound.css"; // Ensure this file exists for better styling

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link to="/home" className="home-button">Go to Home</Link>
    </div>
  );
};

// Since no props are used, no need for PropTypes here

export default NotFound;
