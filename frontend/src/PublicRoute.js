import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PublicRoute = ({ element: Element }) => {
  // Retrieve user information from cookies
  const user = JSON.parse(Cookies.get("user") || sessionStorage.getItem("user"));
  
  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Check if the user is an admin
  const isAdmin = isAuthenticated && user.isAdmin === "True";

  // Redirect logic based on authentication status
  return !isAuthenticated ? (
    <Element /> // Render the public element if the user is not authenticated
  ) : (
    <Navigate to={isAdmin ? "/home-admin" : "/account"} /> // Redirect to /home-admin if admin, else /account
  );
};

export default PublicRoute;
