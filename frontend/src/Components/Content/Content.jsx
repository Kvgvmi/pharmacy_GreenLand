import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Content.css";
import img1 from "./Images/img2.png";

const Content = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = Cookies.get("user") || sessionStorage.getItem("user");
    if (storedUser) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <div>
      <div id="img-container">
        <img src={img1} alt="background" />
        <div className="top-text">YOUR HEALTH, OUR PRIORITY</div>
        <div className="button-container">
          <Link to="/products">
            <button className="btn btn-primary">Discover our products</button>
          </Link>
          {!isAuthenticated && (
            <Link to="/login">
              <button className="btn btn-secondary">Log in</button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Content;
