import React, { useEffect, useState } from "react";
import Header from "./Components/Header/Header";
import NavBar from "./Components/NavBar/NavBar";
import Footer from "./Components/Footer/Footer";
import axios from "axios";
import { getImageSrc, handleImageError } from "./utils/ImageHelper";
import "./Bio.css"; // You would need to create this CSS file
import "bootstrap-icons/font/bootstrap-icons.css";
import LoadingSpinner from "./Components/LoadingSpinner/LoadingSpinner.jsx";
import ProductModal from "./Components/ProductModal/ProductModal";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Bio() {
  const [bioProducts, setBioProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [isTestMode]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the correct API endpoint
      const endpoint = 'http://localhost:8000/api/bio';
      
      console.log(`Fetching bio products from ${endpoint}...`);
      
      const response = await axios.get(endpoint, {
        timeout: 10000, // 10 seconds timeout
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response received:', response.data);
      setBioProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      
      if (error.response) {
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        setError(`Server error: ${error.response.status} - ${error.response.data.message || error.message}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        setError('No response received from server. Check if backend is running.');
      } else {
        console.error('Error message:', error.message);
        setError(`Request error: ${error.message}`);
      }
      
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    const user = Cookies.get("user") || sessionStorage.getItem("user");
    if (!user) {
      Swal.fire({
        title: "Error",
        text: "You must be logged in to add a product to cart.",
        icon: "error",
        confirmButtonColor: "#009900",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1000);
      return;
    } else {
      try {
        const userData = JSON.parse(user);
        const userId = userData.id;

        // Send request to add product to cart
        await axios.post("http://localhost:8000/api/add-to-cart", {
          id_product: product.ID_PRODUCT,
          id_user: userId,
        });

        // Show success alert using SweetAlert2
        Swal.fire({
          title: "Success!",
          text: "Product added to cart successfully!",
          icon: "success",
          confirmButtonColor: "#009900",
        });
      } catch (err) {
        console.error("Error adding product to cart:", err);

        Swal.fire({
          title: "Error!",
          text: "Error adding product to cart.",
          icon: "error",
          confirmButtonColor: "#009900",
        });
      }
    }
  };

  // No longer needed as we use ImageHelper

  const handleMouseMove = (e, product) => {
    const img = e.target;
    const { left, top, width, height } = img.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const toggleTestMode = () => {
    setIsTestMode(!isTestMode);
    // Will trigger useEffect to re-fetch
  };

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="container">
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error!</h4>
        <p>{error}</p>
        <hr />
        <div className="d-flex">
          <button 
            onClick={fetchProducts}
            className="btn btn-danger me-2"
          >
            Try Again
          </button>
          {!isTestMode && (
            <button 
              onClick={() => setIsTestMode(true)}
              className="btn btn-success"
            >
              Switch to Test Data
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Header />
      <NavBar />
      <div id="BioProductsContent" className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-center mt-2">Bio Products</h1>
          <div>
           
            
          </div>
        </div>
        
        <div className="row">
          {bioProducts.length === 0 ? (
            <p>No bio products available.</p>
          ) : (
            bioProducts.map((product) => (
              <div key={product.ID_PRODUCT} className="col-md-4 mb-3">
                <div className="card">
                  <div className="img-container">
                    <img
                      src={getImageSrc(product.IMAGE_PRODUCT, product.NAME_PRODUCT)}
                      className="card-img-top"
                      alt={product.NAME_PRODUCT}
                      onMouseMove={(e) => handleMouseMove(e, product)}
                      onError={(e) => handleImageError(e, product.NAME_PRODUCT)}
                    />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title text-center">
                      {product.NAME_PRODUCT}
                    </h5>
                    <p className="card-text text-center">
                      {product.PRICE_PRODUCT} DH
                    </p>
                    {product.STOCK !== null && (
                      <p className={`stock-status text-center ${product.STOCK > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.STOCK > 0 ? `In Stock (${product.STOCK})` : 'Out of Stock'}
                      </p>
                    )}
                    <div id="ButtonContainer">
                      <button
                        className="btn btn-custom-green"
                        onClick={() => handleViewDetails(product)}
                      >
                        <i className="fa fa-eye" aria-hidden="true"></i> View
                        Details
                      </button>
                      <button
                        className="btn btn-custom-green"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.STOCK <= 0}
                      >
                        <i className="fa fa-shopping-cart" aria-hidden="true"></i> Add
                        to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default Bio;