import React, { useEffect, useState } from "react";
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom"; // To get URL parameters
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner.jsx";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import "./ProductPage.css"; // Import the specific CSS for this page
import NavBar from "../NavBar/NavBar.jsx";

function ProductPage() {
  const { id } = useParams(); // Get the product ID from the URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(product?.PRICE_PRODUCT || 0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:8081/product/${id}`);
        if (res.status === 200) {
          setProduct(res.data);
          setTotalPrice(res.data.PRICE_PRODUCT); // Set initial total price
        } else {
          setError("Error fetching product");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Error fetching product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      setTotalPrice(product.PRICE_PRODUCT * quantity);
    }
  }, [quantity, product]);

  const handleQuantityChange = (e) => {
    const value = e.target.value; // Get the input value as a string

    // Allow empty input
    if (value === "") {
      setQuantity("");
    } else {
      const numberValue = parseInt(value, 10);

      // Update the quantity only if it's within the range
      if (numberValue >= 1 && numberValue <= product.STOCK_PRODUCT) {
        setQuantity(numberValue);
      } else if (numberValue > product.STOCK_PRODUCT) {
        setQuantity(product.STOCK_PRODUCT); // Reset to max if overstock
      } else if (numberValue < 1) {
        setQuantity(1); // Reset to minimum if understock
      }
    }
  };

  const handleAddToCart = async () => {
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
      return; // Stop the function if not logged in
    }

    try {
      const userData = JSON.parse(user);
      const userId = userData.id;

      await axios.post("http://localhost:8081/add-to-cart", {
        id_product: product.ID_PRODUCT,
        id_user: userId,
        quantity_product: quantity,
      });

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
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p>{error}</p>;

  const bufferToBase64 = (buffer) => {
    const base64String = Buffer.from(buffer).toString("base64");
    return `data:image/png;base64,${base64String}`;
  };

  return (
    <div>
      <Header />
      <NavBar />
      <div className="product-page-container">
        <div className="product-details-container">
        <h1 className="product-title">{product.NAME_PRODUCT}</h1>
          <div className="product-row">
            <div className="product-image">
              <img
                src={
                  product.IMAGE_PRODUCT
                    ? bufferToBase64(product.IMAGE_PRODUCT.data)
                    : "default-image-url"
                }
                alt={product.NAME_PRODUCT}
                className="img-fluid"
              />
            </div>
            <div className="product-details">
              <h3 className="product-price">
                <strong>Unit Price : </strong> {product.PRICE_PRODUCT} DH
              </h3>
              <p className="modal-description">
                <strong>Description : </strong>
                {product.DESCRIPTION_PRODUCT}
              </p>
              <p className="modal-expiry">
                <strong>Expiring date : </strong>
                {new Date(product.EXPDATE_PRODUCT).toLocaleDateString()}
              </p>
              <p className="modal-stock">
                <strong>Stock quantity : </strong>
                {product.STOCK_PRODUCT}
              </p>
              <div className="quantity-container">
                <span className="quantity-label">
                  <strong>Quantity</strong>
                </span>
                <input
                  type="number"
                  min="1"
                  max={product.STOCK_PRODUCT}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="quantity-input"
                />
              </div>
              <div className="total-price-container">
                <span className="total-price-label">
                  <strong>Total price : </strong>
                </span>
                <span className="total-price">{totalPrice} DH</span>
              </div>
              <button
                className="btn btn-custom-green"
                onClick={handleAddToCart}
              >
                <i className="fa fa-shopping-cart" aria-hidden="true"></i> Add
                to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ProductPage;
