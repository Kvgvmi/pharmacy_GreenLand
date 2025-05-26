import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddProductPage.css";
import { useParams, useNavigate } from "react-router-dom";
import { getImageSrc } from "./utils/ImageHelper";
import apiConfig from "./config/api";

const UpdateProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [expdate, setExpdate] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(""); // L'image de produit
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategoriesAndProduct = async () => {
      try {
        // Show debug message
        console.log('Starting data fetch for product ID:', id);
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await axios.get(apiConfig.endpoints.categories);
        setCategories(categoriesResponse.data);
        console.log("Categories loaded:", categoriesResponse.data);

        // Fetch product data with detailed error handling
        try {
          const productUrl = apiConfig.endpoints.getProduct(id);
          console.log(`Fetching product data from: ${productUrl}`);
          const productResponse = await axios.get(productUrl);
          
          if (!productResponse.data) {
            throw new Error('Product data is empty');
          }
          
          const product = productResponse.data;
          console.log("Product data loaded:", product);

          // Set form values with detailed logging and defaults
          console.log('Setting product name:', product.NAME_PRODUCT);
          setName(product.NAME_PRODUCT || "");
          
          console.log('Setting product description:', product.DESCRIPTION_PRODUCT);
          setDescription(product.DESCRIPTION_PRODUCT || "");
          
          // Handle the expiry date properly
          const expiryDate = product.EXPIRY_DATE || product.EXPDATE_PRODUCT;
          console.log('Raw expiry date:', expiryDate);
          
          if (expiryDate) {
            const formattedDate = typeof expiryDate === 'string' ? expiryDate.split("T")[0] : '';
            console.log('Formatted expiry date:', formattedDate);
            setExpdate(formattedDate);
          }
          
          // Handle price - ensure it's a number before using toFixed
          const rawPrice = product.PRICE_PRODUCT;
          console.log('Raw price value:', rawPrice);
          const priceValue = parseFloat(rawPrice);
          const formattedPrice = isNaN(priceValue) ? "" : priceValue.toFixed(2);
          console.log('Formatted price:', formattedPrice);
          setPrice(formattedPrice);
          
          // Handle stock
          const stockValue = product.STOCK || product.STOCK_PRODUCT || 0;
          console.log('Stock value:', stockValue);
          setStock(stockValue);
          
          // Store image data
          console.log('Image data type:', typeof product.IMAGE_PRODUCT);
          console.log('Image data value:', product.IMAGE_PRODUCT ? 'exists' : 'null');
          setImage(product.IMAGE_PRODUCT);

          // Handle category IDs
          const categoryId = product.CATEGORY_ID || 
                           (product.categories ? product.categories.split(',').map(Number) : []);
          console.log('Category ID raw:', product.CATEGORY_ID);
          console.log('Final category IDs:', Array.isArray(categoryId) ? categoryId : [categoryId]);
          setSelectedCategories(Array.isArray(categoryId) ? categoryId : [categoryId]);
          
        } catch (productError) {
          console.error('Error fetching specific product:', productError);
          alert(`Error fetching product data: ${productError.message}`);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données du produit ou des catégories", error);
      }
    };

    fetchCategoriesAndProduct();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result.split(",")[1]);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = parseInt(e.target.value);
    setSelectedCategories((prev) =>
      e.target.checked
        ? [...prev, categoryId]
        : prev.filter((id) => id !== categoryId)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a simplified FormData object with just the essential fields
      const formData = new FormData();
      
      // Add basic fields with detailed logging
      console.log('Preparing form data for submission');
      
      formData.append('name', name);
      console.log('Added name:', name);
      
      formData.append('description', description);
      console.log('Added description:', description);
      
      formData.append('expdate', expdate);
      console.log('Added expiry date:', expdate);
      
      formData.append('price', price);
      console.log('Added price:', price);
      
      formData.append('stock', stock);
      console.log('Added stock:', stock);
      
      if (selectedCategories.length > 0) {
        formData.append('category_id', selectedCategories[0]);
        console.log('Added category ID:', selectedCategories[0]);
      }
      
      // Handle image data correctly
      if (typeof image === 'object' && image instanceof File) {
        console.log('Appending new image file:', image.name);
        formData.append('image', image);
      } else if (image && typeof image === 'string' && image.startsWith('data:')) {
        // Handle base64 image data
        console.log('Converting base64 image to file');
        try {
          const response = await fetch(image);
          const blob = await response.blob();
          const file = new File([blob], 'product_image.jpg', { type: 'image/jpeg' });
          formData.append('image', file);
          console.log('Added converted image file');
        } catch (imageError) {
          console.error('Failed to convert image:', imageError);
        }
      }
      
      // Use the API config for consistent endpoint usage
      const updateUrl = apiConfig.endpoints.updateProduct(id);
      console.log('Sending update request to:', updateUrl);
      
      // Use PUT method as specified in the API route
      try {
        const response = await axios.put(
          updateUrl, 
          formData, 
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        console.log('Update response:', response.data);
        alert(response.data.message || 'Product updated successfully');
        navigate("/display-products");
      } catch (requestError) {
        // Log detailed error information
        console.error('Update error details:', requestError.response?.data || requestError.message);
        console.log('First update attempt failed, trying alternative approach');
        
        // Try with POST as a fallback
        const fallbackResponse = await axios.post(
          updateUrl, 
          formData, 
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        console.log('Fallback update response:', fallbackResponse.data);
        alert(fallbackResponse.data.message || 'Product updated successfully');
        navigate("/display-products");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      
      // More detailed error reporting
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        // Show a more helpful error message
        const errorMessage = error.response.data?.message || error.message;
        alert(`Update failed: ${errorMessage}. Please try again with a simpler update (e.g., without changing the image).`);
      } else {
        alert(`Update error: ${error.message}. Please try again or contact support.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="formAddProduct" className="add-product-page">
      <h1>Mettre à jour le produit</h1>
      {/* Display a default image or the current product image */}
      <img
        src={process.env.PUBLIC_URL + "/assets/images/default-product.png"}
        alt="Product image"
        style={{ width: "100px", height: "100px", objectFit: "cover" }}
      />
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom :</label>
          <input
            type="text"
            placeholder="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description :</label>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Date d'expiration :</label>
          <input
            type="date"
            value={expdate}
            onChange={(e) => setExpdate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Prix :</label>
          <input
            type="number"
            placeholder="Prix"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label>Quantité en stock :</label>
          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            min="0"
          />
        </div>
        <div>
          <label>Nouvelle image :</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <div className="category-container">
          <label className="category-title">Catégories :</label>
          {categories.map((category) => (
            <div key={category.id_category} className="category-checkbox">
              <input
                type="checkbox"
                value={category.id_category}
                checked={selectedCategories.includes(category.id_category)}
                onChange={handleCategoryChange}
                id={`category-${category.id_category}`}
              />
              <label htmlFor={`category-${category.id_category}`}>
                {category.name_category}
              </label>
            </div>
          ))}
        </div>
        <button id="updateProduct" type="submit" disabled={loading}>
          {loading ? "Mise à jour..." : "Mettre à jour le produit"}
        </button>
      </form>
    </div>
  );
};

export default UpdateProductPage;
