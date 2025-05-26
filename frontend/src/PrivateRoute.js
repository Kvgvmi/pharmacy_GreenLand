import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateRoute = ({ element: Element }) => {
  const isAuthenticated = Cookies.get("user") || sessionStorage.getItem("user");

  return isAuthenticated ? <Element /> : <Navigate to="/login" />;
};

export default PrivateRoute;
