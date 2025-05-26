import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

function CartDebug() {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDebugData = async () => {
      try {
        const user = Cookies.get("user") || sessionStorage.getItem("user");
        if (!user) {
          setError("No user found in cookies or session storage");
          setLoading(false);
          return;
        }

        const userData = JSON.parse(user);
        const userId = userData.id;
        
        console.log("Debug: Fetching for user ID:", userId);
        
        // First try to hit the debug endpoint
        const debugResponse = await axios.get(
          `http://localhost:8081/cart-debug/${userId}`
        );
        
        console.log("Debug response:", debugResponse.data);
        setDebugData(debugResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Debug error:", err);
        setError(`Debug error: ${err.message}`);
        
        // Try to get more error details if available
        if (err.response && err.response.data) {
          console.error("Debug error details:", err.response.data);
          setError(`${err.message}: ${JSON.stringify(err.response.data)}`);
        }
        
        setLoading(false);
      }
    };

    fetchDebugData();
  }, []);

  if (loading) return <div>Loading debug data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Cart Debug Information</h1>
      
      <h2>User ID</h2>
      <pre>{debugData.user_id}</pre>
      
      <h2>Tables</h2>
      <div>Cart table exists: {debugData.cart_table_exists ? "Yes" : "No"}</div>
      <div>Products table exists: {debugData.products_table_exists ? "Yes" : "No"}</div>
      
      <h2>Cart Columns</h2>
      <pre>{JSON.stringify(debugData.cart_columns, null, 2)}</pre>
      
      <h2>Product Columns</h2>
      <pre>{JSON.stringify(debugData.product_columns, null, 2)}</pre>
      
      <h2>Raw Cart Items</h2>
      <pre>{JSON.stringify(debugData.raw_cart_items, null, 2)}</pre>
      
      <h2>User Info from Storage</h2>
      <pre>{Cookies.get("user") || sessionStorage.getItem("user") || "No user data found"}</pre>
    </div>
  );
}

export default CartDebug;