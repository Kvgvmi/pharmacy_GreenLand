import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateAdminRoute = ({ element: Component }) => {
  // Retrieve user information from cookies
  const user = JSON.parse(Cookies.get("user") || sessionStorage.getItem("user"));
  
  // Check if user is logged in and is an admin
  const isAdmin = user && user.isAdmin === "True";

  return isAdmin ? (
    <Component /> // Render the admin component if the user is an admin
  ) : (
    <Navigate to="/login" /> // Redirect to login if not an admin
  );
};

export default PrivateAdminRoute;
