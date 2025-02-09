import React from 'react';
import "../styles/LoadingSpinner.css";  // Add CSS for the spinner

const LoadingSpinner = () => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;
