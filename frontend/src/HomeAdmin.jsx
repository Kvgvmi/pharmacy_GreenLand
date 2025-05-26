import React from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./HomeAdmin.css"; // Import your CSS file

function HomeAdmin() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all sessions and cookies
    Cookies.remove("user");
    sessionStorage.removeItem("user");

    // Redirect to home page
    navigate("/");
  };

  return (
    <div
      id="admin-page-container"
      className="d-flex flex-column align-items-center"
    >
      <h1 id="admin-page-title">Admin Dashboard</h1>

      <button
        id="user-interface-button"
        className="admin-action-button btn btn-primary mb-3"
        onClick={() => navigate("/account")}
      >
        User Interface
      </button>

      <button
        id="add-product-button"
        className="admin-action-button btn btn-primary mb-3"
        onClick={() => navigate("/add-product")}
      >
        Add a Product
      </button>

      <button
        id="manage-products-button"
        className="admin-action-button btn btn-primary mb-3"
        onClick={() => navigate("/display-products")}
      >
        Manage Products
      </button>

      <button
        id="feedbacks-button"
        className="admin-action-button btn btn-primary mb-3"
        onClick={() => navigate("/see-feedbacks")}
      >
        Feedbacks
      </button>

      <button
        id="prescriptions-button"
        className="admin-action-button btn btn-primary mb-3"
        onClick={() => navigate("/see-prescriptions")}
      >
        Prescriptions
      </button>

      <button
        id="orders-button"
        className="admin-action-button btn btn-primary mb-3"
        onClick={() => navigate("/see-orders")}
      >
        Orders
      </button>

      <button
        id="logout-button"
        className="btn btn-danger mt-5"
        onClick={handleLogout}
      >
        Log Out
      </button>
    </div>
  );
}

export default HomeAdmin;
