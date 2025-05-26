import React, { useEffect, useState } from "react";
import Header from "./Components/Header/Header.jsx";
import NavBar from "./Components/NavBar/NavBar.jsx";
import Footer from "./Components/Footer/Footer.jsx";
import axios from "axios";
import { getImageSrc, handleImageError } from "./utils/ImageHelper";
import "./Products.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import ProductModal from "./Components/ProductModal/ProductModal"; // Import ProductModal
import LoadingSpinner from "./Components/LoadingSpinner/LoadingSpinner.jsx";
import Cookies from "js-cookie"; // Assuming you're using js-cookie library
import { useNavigate } from "react-router-dom"; // If you're using react-router-dom
import Swal from "sweetalert2";
import API from "./config/api"; // Import the API config

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  const handleAddToCart = async (product) => {
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

        console.log('Adding product to cart:', product);
        
        // Send request to add product to cart with quantity parameter
        await axios.post(API.endpoints.addToCart, {
          id_product: product.ID_PRODUCT,
          id_user: userId,
          quantity: 1 // Adding required quantity parameter
        });

        // Show success alert using SweetAlert2
        Swal.fire({
          title: "Success!",
          text: "Product added to cart successfully!",
          icon: "success",
          confirmButtonColor: "#009900", // Match your page's theme
        });
      } catch (err) {
        console.error("Error adding product to cart:", err);
        // Show more detailed error information
        if (err.response) {
          console.error("Error response:", err.response.data);
        }

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

  useEffect(() => {
    axios.get(API.endpoints.products)
      .then((res) => {
        console.log("Response data:", res.data);
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

  if (loading) return <LoadingSpinner />;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <Header />
      <NavBar />
      <div id="ProductsContent" className="container">
        <h1 className="text-center mt-2 mb-4">Our Products</h1>
        <div className="row">
          {products.length === 0 ? (
            <p>No products available</p>
          ) : (
            products.map((product) => (
              <div key={product.ID_PRODUCT} className="col-md-4 mb-3">
                <div className="card">
                  <div className="img-container">
                    <img
                      src={getImageSrc(product.IMAGE_PRODUCT, product.NAME_PRODUCT)}
                      className="card-img-top product-card-image"
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

export default Products;
