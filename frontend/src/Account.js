import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import Header from "./Components/Header/Header";
import NavBar from "./Components/NavBar/NavBar";
import Footer from "./Components/Footer/Footer";
import "./Account.css";

function Account() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = Cookies.get("user") || sessionStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchOrders(parsedUser.id);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchOrders = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/orders/${userId}`
      );
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleLogout = () => {
    Cookies.remove("user");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  // Function to format date and time as DD-MM-YYYY HH:MM:SS
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div>
      <Header />
      <NavBar />
      <div id="AccountContent">
        {user ? (
          <div id="AccountContainer">
            <div id="UserInfoContainer">
              <h1>Your Informations</h1>
              <div className="UserInfoField">
                <label>Username:</label>
                <input type="text" value={user.username} readOnly />
              </div>
              <div className="UserInfoField">
                <label>Email:</label>
                <input type="text" value={user.email} readOnly />
              </div>
              <div className="UserInfoField">
                <label>Phone:</label>
                <input type="text" value={user.phone} readOnly />
              </div>
              <div className="UserInfoField">
                <label>City:</label>
                <input type="text" value={user.city} readOnly />
              </div>

              {user.isAdmin === "True" && (
                <button
                  className="admin-dashboard-btn"
                  onClick={() => navigate("/home-admin")}
                >
                  Admin Dashboard
                </button>
              )}

              <button className="account-logout-btn" onClick={handleLogout}>Log out</button>
            </div>

            <div id="OrdersContainer">
              <h1>Your Orders</h1>
              {orders.length > 0 ? (
                <table className="OrdersTable">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Total Amount</th>
                      <th>Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id_order}>
                        <td>{order.id_order}</td>
                        <td>{order.total_amount.toFixed(2)} DH</td>
                        <td>{formatDateTime(order.date_order)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>You have no orders.</p>
              )}
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Account;
