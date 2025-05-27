import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Header from "./Components/Header/Header";
import NavBar from "./Components/NavBar/NavBar";
import Footer from "./Components/Footer/Footer";
import "./Cart.css";
import LoadingSpinner from "./Components/LoadingSpinner/LoadingSpinner";
import Swal from "sweetalert2"; // Import SweetAlert2
import API from "./config/api"; // Import the API config

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [modifiedQuantities, setModifiedQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();

  // Calculate total price whenever cart items or modified quantities change
  useEffect(() => {
    let calculatedTotal = 0;
    cartItems.forEach((item) => {
      const quantity = modifiedQuantities[item.id_product] || item.quantity;
      calculatedTotal += quantity * item.price_product;
    });
    setTotalPrice(calculatedTotal);
  }, [cartItems, modifiedQuantities]);

  useEffect(() => {
    const fetchCartItems = async () => {
      const user = Cookies.get("user") || sessionStorage.getItem("user");
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const userData = JSON.parse(user);
        const userId = userData.id;
        
        // Add some error handling to debug network issues
        console.log(`Fetching cart items for user ID: ${userId}`);
        
        const response = await axios.get(
          `${API.baseURL}/api/cart-items/${userId}`
        );
        
        console.log("Cart items response:", response.data);
        setCartItems(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching cart items:", err);
        // Enhanced error logging
        if (err.response) {
          console.error("Response status:", err.response.status);
          console.error("Response data:", err.response.data);
        }
        setError("Error fetching cart items. Please try again later.");
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [navigate]);

  const handleQuantityChange = (idProduct, newQuantity) => {
    setModifiedQuantities((prev) => ({
      ...prev,
      [idProduct]: newQuantity,
    }));
  };

  const handleUpdateQuantities = async () => {
    try {
      const user = Cookies.get("user") || sessionStorage.getItem("user");
      if (!user) {
        navigate("/login");
        return;
      }

      const userData = JSON.parse(user);
      const userId = userData.id;

      // Format the items in the way our backend expects
      const itemsToUpdate = [];
      
      Object.keys(modifiedQuantities).forEach(productId => {
        const cartItem = cartItems.find(item => item.id_product.toString() === productId.toString());
        if (cartItem) {
          itemsToUpdate.push({
            cart_item_id: cartItem.cart_item_id,
            quantity: modifiedQuantities[productId]
          });
        }
      });
      
      await axios.put(`${API.baseURL}/api/update-cart-items`, {
        items: itemsToUpdate
      });

      // Refresh cart items
      const response = await axios.get(
        `${API.baseURL}/api/cart-items/${userId}`
      );
      setCartItems(response.data);
      setModifiedQuantities({});
      Swal.fire({
        title: "Success!",
        text: "Cart items updated successfully!",
        icon: "success",
        confirmButtonColor: "#009900",
      });
    } catch (err) {
      console.error("Error updating cart items:", err);
      // Enhanced error logging
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      }
      Swal.fire({
        title: "Error!",
        text: "Error updating cart items.",
        icon: "error",
        confirmButtonColor: "#009900",
      });
    }
  };

  const handleDeleteProduct = async (idProduct) => {
    try {
      const user = Cookies.get("user") || sessionStorage.getItem("user");
      if (!user) {
        navigate("/login");
        return;
      }

      const userData = JSON.parse(user);
      const userId = userData.id;

      // Find the cart_item_id for this product
      const cartItem = cartItems.find(item => item.id_product === idProduct);
      
      if (!cartItem) {
        console.error(`Cart item with product ID ${idProduct} not found`);
        Swal.fire({
          title: "Error!",
          text: "Product not found in cart.",
          icon: "error",
          confirmButtonColor: "#009900",
        });
        return;
      }
      
      await axios.delete(`${API.baseURL}/api/delete-cart-item`, {
        data: { cart_item_id: cartItem.cart_item_id },
      });

      setCartItems(cartItems.filter((item) => item.id_product !== idProduct));
      Swal.fire({
        title: "Deleted!",
        text: "Product has been removed from your cart.",
        icon: "success",
        confirmButtonColor: "#009900",
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error("Error deleting cart item:", err);
      // Enhanced error logging
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      }
      Swal.fire({
        title: "Error!",
        text: "Error deleting cart item.",
        icon: "error",
        confirmButtonColor: "#009900",
      });
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="error-message">{error}</p>;

  const handleOrder = async () => {
    try {
      const user = Cookies.get("user") || sessionStorage.getItem("user");
      if (!user) {
        navigate("/login");
        return;
      }

      const userData = JSON.parse(user);
      const userId = userData.id;

      // Create order data with products
      const orderData = {
        id_user: userId,
        price_order: totalPrice,
        date_order: new Date().toISOString().slice(0, 19).replace("T", " "),
        products: cartItems.map((item) => ({
          id_product: item.id_product,
          quantity: modifiedQuantities[item.id_product] || item.quantity,
        })),
      };

      // Create a new order
      const orderResponse = await axios.post(`${API.baseURL}/api/orders`, orderData);
      const orderId = orderResponse.data.orderId;

      // Create order details
      const orderDetails = cartItems.map((item) => ({
        id_product: item.id_product,
        quantity_product: modifiedQuantities[item.id_product] || item.quantity,
        price_product: (modifiedQuantities[item.id_product] || item.quantity) * item.price_product,
      }));

      await axios.post(`${API.baseURL}/api/order-details`, {
        id_order: orderId,
        orderDetails: orderDetails,
      });

      // Clear the cart
      await axios.delete(`${API.baseURL}/api/clear-cart/${userId}`);
      setCartItems([]);
      Swal.fire({
        title: "Order Placed!",
        text: "Your order has been placed successfully.",
        icon: "success",
        confirmButtonColor: "#009900",
      });
      navigate("/");
    } catch (err) {
      console.error("Error placing order:", err.response ? err.response.data : err.message);
      // Enhanced error logging
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      }
      Swal.fire({
        title: "Error!",
        text: "Error placing order.",
        icon: "error",
        confirmButtonColor: "#009900",
      });
    }
  };

  return (
    <div className="cart-page">
      <Header />
      <NavBar />
      <div className="cart-container">
        <h1>Your Cart</h1>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id_product}>
                    <td>{item.name_product}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        max={item.stock_product}
                        value={
                          modifiedQuantities[item.id_product] || item.quantity
                        }
                        onChange={(e) =>
                          handleQuantityChange(
                            item.id_product,
                            parseInt(e.target.value, 10)
                          )
                        }
                        className="quantity-input"
                      />
                    </td>
                    <td>{item.price_product} DH</td>
                    <td>
                      {(modifiedQuantities[item.id_product] || item.quantity) *
                        item.price_product}{" "}
                      DH
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-delete"
                        onClick={() => handleDeleteProduct(item.id_product)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="cart-total">
              <h2>Total Price: {totalPrice} DH</h2>
              <div className="cart-buttons-container">
                <button className="order-button" onClick={handleOrder}>
                  Order
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Cart;