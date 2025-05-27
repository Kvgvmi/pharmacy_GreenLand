import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProductModal.css";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getImageSrc, handleImageError } from "../../utils/ImageHelper";
import apiConfig from "../../config/api"; // Import API configuration

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const ProductModal = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(product.PRICE_PRODUCT);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    setTotalPrice(product.PRICE_PRODUCT * quantity);
  }, [quantity, product.PRICE_PRODUCT]);

  const handleQuantityChange = (e) => {
    // Only allow numeric input (digits and empty string)
    const value = e.target.value.replace(/[^0-9]/g, '');
    
    if (value === "") {
      setQuantity(""); // Allow empty temporarily while typing
      return;
    }
    
    const numberValue = parseInt(value, 10);
    const maxStock = product.STOCK_PRODUCT || 100; // Default to 100 if stock not available
    
    // Keep quantity within valid range (1 to max stock)
    if (numberValue >= 1 && numberValue <= maxStock) {
      setQuantity(numberValue);
    } else if (numberValue > maxStock) {
      setQuantity(maxStock);
    }
  };
  
  // Handle blur to ensure quantity is valid when input loses focus
  const handleQuantityBlur = () => {
    // If quantity is empty or less than 1, set it to 1
    if (quantity === "" || quantity < 1) {
      setQuantity(1);
    }
  };

  const handleAddToCart = async () => {
    const user = Cookies.get("user") || sessionStorage.getItem("user");
    if (!user) {
      Swal.fire({
        title: "Error",
        text: "You must be logged in to add a product to cart.",
        icon: "error",
        confirmButtonColor: "#009900", // Match page theme
      });

      setTimeout(() => {
        navigate("/login");
      }, 1000);
      return;
    } else {
      try {
        const userData = JSON.parse(user);
        const userId = userData.id;

        // Ensure product.ID_PRODUCT is defined
        if (!product.ID_PRODUCT) {
          throw new Error("Product ID is missing.");
        }

        // Send request to add product to cart using the apiConfig
        await axios.post(apiConfig.endpoints.addToCart, {
          id_product: product.ID_PRODUCT,
          id_user: userId,
          quantity: quantity, // Use consistent parameter name across the application
        });

        // Show success alert using SweetAlert2
        Swal.fire({
          title: "Success!",
          text: "Product added to cart successfully!",
          icon: "success",
          confirmButtonColor: "#009900", // Match your page's theme
        });

        onClose(); // Close the modal after adding to cart
      } catch (err) {
        console.error("Error adding product to cart:", err);

        // Show error alert using SweetAlert2
        Swal.fire({
          title: "Error!",
          text: "Error adding product to cart.",
          icon: "error",
          confirmButtonColor: "#009900", // Match your page's theme
        });
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button
          className="close-button"
          onClick={() => {
            console.log("Close button clicked"); // Debugging line
            onClose();
          }}
        >
          ×
        </button>
        <div className="modal-body">
          <div className="modal-image">
            <img
              src={getImageSrc(product.IMAGE_PRODUCT)}
              alt={product.NAME_PRODUCT}
              onError={(e) => handleImageError(e, product.NAME_PRODUCT)}
            />
          </div>
          <div className="modal-details">
            <h2 className="modal-title">{product.NAME_PRODUCT}</h2>
            <p className="modal-description">{product.DESCRIPTION_PRODUCT}</p>
            {/* Stock quantity and expiration date removed as requested */}
            <p className="modal-price">Price: {product.PRICE_PRODUCT} DH</p>
            <div className="quantity-container">
              <span className="quantity-label">Quantity</span>
              <div className="quantity-controls">
                <button 
                  type="button" 
                  className="quantity-btn" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input
                  type="text"
                  min="1"
                  max={product.STOCK_PRODUCT || 100}
                  value={quantity}
                  onChange={handleQuantityChange}
                  onBlur={handleQuantityBlur}
                  className="quantity-input"
                />
                <button 
                  type="button" 
                  className="quantity-btn" 
                  onClick={() => setQuantity(Math.min(product.STOCK_PRODUCT || 100, quantity + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
            <div className="total-price-container">
              <span className="total-price-label">Total Price:</span>
              <span className="total-price">{totalPrice} DH</span>
            </div>
            <button className="btn btn-custom-green" onClick={handleAddToCart}>
              <i className="fa fa-shopping-cart" aria-hidden="true"></i> Add to
              Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
