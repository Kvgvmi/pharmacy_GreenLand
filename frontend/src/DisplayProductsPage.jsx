import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./DisplayProductsPage.css"; // Import the updated CSS
import "bootstrap-icons/font/bootstrap-icons.css";
import LoadingSpinner from "./Components/LoadingSpinner/LoadingSpinner.jsx";
import { getImageSrc, handleImageError } from "./utils/ImageHelper";
import apiConfig from "./config/api"; // Import API configuration

function DisplayProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Add navigate hook

  useEffect(() => {
    axios
      .get(apiConfig.endpoints.products)
      .then((res) => {
        if (res.status === 200) {
          setProducts(res.data);
          setLoading(false);
        } else {
          setError("Error fetching products");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError("Error fetching products");
        setLoading(false);
      });
  }, []);

  const handleEditProduct = (productId) => {
    // Redirect to the UpdateProductPage with the product ID using navigate hook
    navigate(`/update-product/${productId}`);
  };

  const handleRemoveProduct = async (productId) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to remove this product?");
      
      if (!confirmDelete) {
        return; // User canceled the deletion
      }
      
      // Show loading state
      setLoading(true);
      
      try {
        // Try a standard DELETE request first
        const response = await axios.delete(`${apiConfig.baseURL}/api/products/${productId}`);
        
        // Check if the deletion was successful
        if (response.status === 200) {
          // Remove from UI if successful
          setProducts(products.filter((product) => product.ID_PRODUCT !== productId));
          alert("Product removed successfully!");
        } else {
          throw new Error(response.data?.message || "Unknown error occurred");
        }
      } catch (firstError) {
        console.error("Error using standard DELETE:", firstError);
        
        try {
          // Fall back to the custom delete endpoint
          const fallbackResponse = await axios.post(`${apiConfig.baseURL}/api/delete-product/${productId}`);
          
          if (fallbackResponse.status === 200) {
            // Remove from UI if successful
            setProducts(products.filter((product) => product.ID_PRODUCT !== productId));
            alert("Product removed successfully using fallback method!");
          } else {
            throw new Error(fallbackResponse.data?.message || "Unknown error occurred");
          }
        } catch (secondError) {
          console.error("Error removing product (fallback also failed):", secondError);
          
          // Ask user if they want to remove it from the UI anyway
          const removeFromUI = window.confirm(
            "There was an error removing the product from the database. Would you like to hide it from the view anyway? (Note: The product will reappear after page refresh)"
          );
          
          if (removeFromUI) {
            // Client-side removal only
            setProducts(products.filter((product) => product.ID_PRODUCT !== productId));
            alert("Product hidden from view. Refresh the page to see all products again.");
          } else {
            alert("Product removal canceled.");
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Using the getImageSrc function from ImageHelper utility

  if (loading) return <LoadingSpinner />;
  if (error) return <p>{error}</p>;

  return (
    <div id="display-products-page">
      <div className="container">
        <h1 id="display-products-title">Products management section</h1>
        <div className="row">
          {products.length === 0 ? (
            <p>No products available</p>
          ) : (
            products.map((product) => (
              <div key={product.ID_PRODUCT} className="col-md-4 mb-3">
                <div className="card product-card">
                  <img
                    src={getImageSrc(product.IMAGE_PRODUCT)}
                    className="card-img-top product-card-image"
                    alt={product.NAME_PRODUCT}
                    onError={(e) => handleImageError(e, product.NAME_PRODUCT)}
                  />
                  <div className="card-body">
                    <h5 className="card-title product-card-title">
                      {product.NAME_PRODUCT}
                    </h5>
                    <p className="card-text product-card-price">
                      {product.PRICE_PRODUCT} DH
                    </p>
                    <div id="button-container">
                      <button
                        className="btn product-action-button product-edit-button"
                        onClick={() => handleEditProduct(product.ID_PRODUCT)}
                      >
                        <i className="fa fa-pencil" aria-hidden="true"></i> Edit
                      </button>
                      <button
                        className="btn product-action-button product-remove-button"
                        onClick={() => handleRemoveProduct(product.ID_PRODUCT)}
                      >
                        <i className="fa fa-trash" aria-hidden="true"></i> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DisplayProductsPage;
