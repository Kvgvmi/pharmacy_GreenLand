import React from "react";
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading products...</p>
    </div>
  );
};

export default LoadingSpinner;
