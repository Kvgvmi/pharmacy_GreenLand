import React, { useEffect, useState } from "react";
import Header from "./Components/Header/Header.jsx";
import NavBar from "./Components/NavBar/NavBar.jsx";
import Footer from "./Components/Footer/Footer.jsx";
import axios from "axios";
import { getImageSrc, handleImageError } from "./utils/ImageHelper";
import "./Products.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import ProductModal from "./Components/ProductModal/ProductModal.jsx";
import LoadingSpinner from "./Components/LoadingSpinner/LoadingSpinner.jsx";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "./config/api"; // Import API configuration

function Medicines() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  
  // API base URL - centralized for easier management
  const API_BASE_URL = "http://localhost:8000/api";

  // Medicine SVG icons based on product ID or category
  const MedicineIcon = ({ productId, categoryId }) => {
    // Use modulo to cycle through different medicine designs
    const designType = productId % 5; // 5 different design types
    
    // Color palette based on category or random if not available
    const getPrimaryColor = () => {
      switch(categoryId) {
        case 1: return "#27ae60"; // Green for general medicine
        case 2: return "#3498db"; // Blue for supplements
        case 3: return "#9b59b6"; // Purple for bio products
        case 4: return "#e74c3c"; // Red for baby products
        default: return ["#27ae60", "#3498db", "#9b59b6", "#e74c3c", "#f39c12"][productId % 5]; // Cycle through colors
      }
    };
    
    const primaryColor = getPrimaryColor();
    const secondaryColor = "white";
    
    switch(designType) {
      case 0: // Pill bottle
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style={{height: '200px', width: '100%', background: '#f8f9fa', padding: '20px'}}>
            <rect x="35" y="10" width="30" height="60" rx="5" fill={primaryColor} />
            <rect x="40" y="20" width="20" height="10" rx="2" fill={secondaryColor} />
            <line x1="35" y1="40" x2="65" y2="40" stroke={secondaryColor} strokeWidth="2" />
            <circle cx="50" cy="80" r="10" fill={primaryColor} />
          </svg>
        );
      
      case 1: // Pills
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style={{height: '200px', width: '100%', background: '#f8f9fa', padding: '20px'}}>
            <ellipse cx="30" cy="40" rx="20" ry="10" fill={primaryColor} />
            <ellipse cx="70" cy="30" rx="20" ry="10" fill={primaryColor} transform="rotate(45,70,30)" />
            <ellipse cx="40" cy="70" rx="20" ry="10" fill={primaryColor} transform="rotate(-45,40,70)" />
            <ellipse cx="65" cy="65" rx="15" ry="8" fill={primaryColor} />
          </svg>
        );
      
      case 2: // Tablets/Capsules
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style={{height: '200px', width: '100%', background: '#f8f9fa', padding: '20px'}}>
            <rect x="20" y="30" width="30" height="15" rx="7.5" fill={primaryColor} />
            <rect x="50" y="50" width="30" height="15" rx="7.5" fill={primaryColor} />
            <ellipse cx="35" cy="60" rx="15" ry="7.5" fill={primaryColor} />
            <ellipse cx="65" cy="30" rx="15" ry="7.5" fill={primaryColor} />
            <line x1="35" y1="37.5" x2="35" y2="37.5" stroke={secondaryColor} strokeWidth="1" />
          </svg>
        );
      
      case 3: // Syrup bottle
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style={{height: '200px', width: '100%', background: '#f8f9fa', padding: '20px'}}>
            <path d="M40,20 L60,20 L65,30 L65,80 C65,83 62,85 60,85 L40,85 C38,85 35,83 35,80 L35,30 Z" fill={primaryColor} />
            <rect x="40" y="10" width="20" height="10" rx="2" fill={primaryColor} />
            <path d="M35,30 L65,30" stroke={secondaryColor} strokeWidth="1" />
            <path d="M40,40 L60,40" stroke={secondaryColor} strokeWidth="1" />
            <path d="M40,50 L60,50" stroke={secondaryColor} strokeWidth="1" />
            <path d="M40,60 L60,60" stroke={secondaryColor} strokeWidth="1" />
          </svg>
        );
      
      case 4: // First aid kit
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style={{height: '200px', width: '100%', background: '#f8f9fa', padding: '20px'}}>
            <rect x="25" y="30" width="50" height="40" rx="5" fill={primaryColor} />
            <rect x="35" y="25" width="30" height="10" rx="3" fill={primaryColor} />
            <rect x="45" y="40" width="10" height="20" fill={secondaryColor} />
            <rect x="40" y="45" width="20" height="10" fill={secondaryColor} />
          </svg>
        );
      
      default: // Generic medicine box
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style={{height: '200px', width: '100%', background: '#f8f9fa', padding: '20px'}}>
            <rect x="25" y="25" width="50" height="50" fill={primaryColor} />
            <rect x="35" y="35" width="30" height="5" fill={secondaryColor} />
            <rect x="35" y="45" width="30" height="5" fill={secondaryColor} />
            <rect x="35" y="55" width="30" height="5" fill={secondaryColor} />
          </svg>
        );
    }
  };

  useEffect(() => {
    const fetchMedicines = () => {
      axios
        .get("http://localhost:8000/api/medicines")
        .then((res) => {
          if (res.status === 200) {
            setProducts(res.data);
            setLoading(false);
          } else {
            setError("Error fetching medicines");
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("Error fetching medicines:", err);
          setError("Error connecting to the server. Please make sure the server is running.");
          setLoading(false);
        });
    };

    fetchMedicines();
  }, []);

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

        console.log('Adding medicine to cart:', product);
        
        // Use the API config endpoint and include the quantity parameter
        await axios.post(API.endpoints.addToCart, {
          id_product: product.ID_PRODUCT,
          id_user: userId,
          quantity: 1 // Adding the required quantity parameter
        });

        Swal.fire({
          title: "Success!",
          text: "Product added to cart successfully!",
          icon: "success",
          confirmButtonColor: "#009900",
        });
      } catch (err) {
        console.error("Error adding product to cart:", err);
        // Show more detailed error information for debugging
        if (err.response) {
          console.error("Error response:", err.response.data);
        }

        Swal.fire({
          title: "Error!",
          text: "Error adding product to cart.",
          icon: "error",
          confirmButtonColor: "#009900",
        });
      }
    }
  };

  const handleMouseMove = (e, product) => {
    const img = e.target;
    if (img && img.getBoundingClientRect) {
      const { left, top, width, height } = img.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      img.style.transformOrigin = `${x}% ${y}%`;
    }
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  if (loading) return <LoadingSpinner />;
  
  if (error) return (
    <div className="container mt-5">
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error Loading Medicines</h4>
        <p>{error}</p>
        <hr />
        <p className="mb-0">
          Please check that your server is running on port 8000 and try refreshing the page.
          If the problem persists, contact technical support.
        </p>
      </div>
    </div>
  );

  return (
    <div>
      <Header />
      <NavBar />
      <div id="ProductsContent" className="container">
        <h1 className="text-center mt-2 mb-4">Our Medicines</h1>
        <div className="row">
          {products.length === 0 ? (
            <p>No products available</p>
          ) : (
            products.map((product) => (
              <div key={product.ID_PRODUCT} className="col-md-4 mb-3">
                <div className="card">
                  <div className="img-container">
                    {/* Try to display actual product image */}
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
                      >
                        <i
                          className="fa fa-shopping-cart"
                          aria-hidden="true"
                        ></i>{" "}
                        Add to Cart
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

export default Medicines;