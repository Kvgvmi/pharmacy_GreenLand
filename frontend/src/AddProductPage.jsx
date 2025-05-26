import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddProductPage.css";
import apiConfig from "./config/api";
// import { useNavigate } from "react-router-dom";

const AddProductPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [expdate, setExpdate] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  // const navigate = useNavigate();

  useEffect(() => {
    // Fetch categories from API
    axios
      .get(apiConfig.endpoints.categories)
      .then((response) => {
        // Log the first category to see its structure
        if (response.data && response.data.length > 0) {
          console.log("First category object structure:", response.data[0]);
        }
        setCategories(response.data);
        console.log("Categories loaded:", response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the categories!", error);
      });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        // Store base64 string without the data:image/jpeg;base64, prefix
        setImage(reader.result.split(",")[1]);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (e) => {
    // Ensure categoryId is parsed as an integer
    const categoryId = parseInt(e.target.value, 10);
    
    // Log for debugging
    console.log(`Category ${categoryId} ${e.target.checked ? 'checked' : 'unchecked'}`);
    
    // Update selected categories
    setSelectedCategories((prev) =>
      e.target.checked
        ? [...prev, categoryId]  // Add to selected
        : prev.filter((id) => id !== categoryId)  // Remove from selected
    );
    
    // Log current selection after update (for next render)
    console.log('Currently selected categories (will be updated):', 
      e.target.checked 
        ? [...selectedCategories, categoryId]
        : selectedCategories.filter(id => id !== categoryId)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate that at least one category is selected
    if (selectedCategories.length === 0) {
      alert("Please select at least one category for the product");
      return;
    }
    
    // Create FormData object for file upload
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category_id', selectedCategories[0]); // Use the first selected category
    
    // Only add expiry date if it's provided
    if (expdate) {
      formData.append('expiry_date', expdate);
    }
    
    // Add stock if provided
    if (stock) {
      formData.append('stock', stock);
    }
    
    // Only append image if it exists
    if (image) {
      try {
        // Convert base64 to blob and append as file
        const byteString = atob(image);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: 'image/jpeg' });
        formData.append('image', blob, 'product-image.jpg');
      } catch (error) {
        console.error("Error processing image:", error);
        alert("There was an error processing the image. Please try again with a different image.");
        return;
      }
    }
    
    // For debugging: log the form data contents
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    
    // Use the API config for the endpoint
    axios
      .post(apiConfig.endpoints.addProduct, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then((response) => {
        // Check if response data has a message property, otherwise use a default message
        const successMessage = response.data && response.data.message 
          ? response.data.message 
          : "Product added successfully!";
          
        alert(successMessage);
        
        // Clear the form
        setName('');
        setDescription('');
        setExpdate('');
        setPrice('');
        setStock('');
        setImage(null);
        setSelectedCategories([]);
        
        // Reload the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      })
      .catch((error) => {
        console.error("There was an error adding the product!", error);
        
        // Extract detailed error information if available
        let errorMessage = "Error adding product";
        
        if (error.response && error.response.data) {
          const responseData = error.response.data;
          console.log("Server error details:", responseData);
          
          if (responseData.message) {
            errorMessage += ": " + responseData.message;
          }
          
          if (responseData.error) {
            errorMessage += "\n\nDetails: " + responseData.error;
          }
        } else {
          errorMessage += ": " + error.message;
        }
        
        alert(errorMessage);
        
        // Try the test endpoint to help diagnose
        axios.get(apiConfig.baseURL + '/api/test-add-product')
          .then(response => {
            console.log("Test product creation result:", response.data);
            if (response.data.message === 'Test product created successfully') {
              alert("Test product was created successfully! The issue might be with the form data.");
            }
          })
          .catch(testError => {
            console.error("Test product creation failed:", testError);
            if (testError.response && testError.response.data) {
              alert("Test product creation failed with error: " + 
                    (testError.response.data.error || testError.message));
            }
          });
      });
  };

  return (
    <div id="formAddProduct" className="add-product-page">
      <h1>Add New Product</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Expiring Date:</label>
          <input
            type="date"
            value={expdate}
            onChange={(e) => setExpdate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Price:</label>
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Stock Quantity:</label>
          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Image:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <div className="category-container">
          <label className="category-title">Categories:</label>
          {categories && categories.length > 0 ? (
            <div className="categories-wrapper">
              {categories.map((category) => {
                // Determine the category ID correctly
                const categoryId = category.id || category.id_category || category.ID_CATEGORY;
                // Determine the category name correctly
                const categoryName = category.name || category.name_category || category.NAME_CATEGORY || 'Unknown Category';
                
                return (
                  <div key={categoryId || 'category-' + Math.random()} className="category-checkbox">
                    <input
                      type="checkbox"
                      value={categoryId}
                      checked={selectedCategories.includes(categoryId)}
                      onChange={handleCategoryChange}
                      id={`category-${categoryId}`}
                    />
                    <label htmlFor={`category-${categoryId}`}>
                      {categoryName}
                    </label>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No categories available. Please add categories first.</p>
          )}
        </div>
        <button id="addProduct" type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default AddProductPage;
