// OrderDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API from "./config/api";
import "./OrderDetails.css"; // Import your CSS file

function OrderDetails() {
  const { id } = useParams();
  const [orderDetails, setOrderDetails] = useState([]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        console.log(`Fetching order details from: ${API.endpoints.orderDetails(id)}`);
        const response = await axios.get(API.endpoints.orderDetails(id));
        
        if (response.data && response.data.data) {
          console.log('Order details received:', response.data.data);
          setOrderDetails(response.data.data);
        } else {
          console.error('Unexpected response format:', response.data);
          setOrderDetails([]);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        console.error("Error details:", error.response?.data || error.message);
      }
    };

    fetchOrderDetails();
  }, [id]);

  return (
    <div id="order-details-page-container">
      <h1 id="order-details-page-title">Order N°{id} Details :</h1>
      <div className="order-details-list">
        {orderDetails.length > 0 ? (
          orderDetails.map((detail) => (
            <div key={detail.ID_ORDERDETAIL} className="order-detail-card">
              <p className="product-name">Product Name: {detail.NAME_PRODUCT}</p>
              <p className="product-id">Product ID: {detail.ID_PRODUCT}</p>
              <p className="quantity">Quantity: {detail.QUANTITY_PRODUCT}</p>
              <p className="price">Price: {detail.PRICE_PRODUCT}DH</p>
            </div>
          ))
        ) : (
          <p>No order details found</p>
        )}
      </div>
    </div>
  );
}

export default OrderDetails;
