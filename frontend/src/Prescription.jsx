import React, { useState } from "react";
import Swal from "sweetalert2";
import Header from "./Components/Header/Header";
import NavBar from "./Components/NavBar/NavBar";
import Footer from "./Components/Footer/Footer";
import LoadingSpinner from "./Components/LoadingSpinner/LoadingSpinner.jsx";
import axios from "axios";
import Cookies from "js-cookie"; // Assuming you're using cookies for user authentication
import "./Prescription.css"; // Import the CSS file for styling
import { useNavigate } from "react-router-dom";
import apiConfig from "./config/api"; // Import the API configuration

function Prescription() {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Set loading to true when form is submitted
    setLoading(true);
  
    const user = Cookies.get("user") || sessionStorage.getItem("user");
    
    if (!user) {
      setLoading(false); // Stop loading if user is not logged in
      Swal.fire({
        title: "Error",
        text: "You must be logged in to submit a prescription.",
        icon: "error",
        confirmButtonColor: "#009900", // Match page theme
      });
  
      setTimeout(() => {
        navigate("/login");
      }, 1000);
      return;
    }
  
    // Check if the prescription image is null
    if (!image) {
      Swal.fire({
        title: "Error",
        text: "Please upload a prescription image before submitting.",
        icon: "error",
        confirmButtonColor: "#009900", // Match page theme
      });
      setLoading(false); // Stop loading if image is missing
      return;
    }
  
    const userData = JSON.parse(user);
    const userId = userData.id;
  
    try {
      // Create FormData for proper file upload
      const formData = new FormData();
      // Use Auth ID if authenticated, otherwise use the user ID from cookie
      formData.append('user_id', userId);  
      // The backend controller is now set up to map 'notes' to 'description' in the database
      formData.append('notes', description);
      
      // Convert base64 to blob and append as file
      if (image) {
        try {
          const byteString = atob(image);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          
          const blob = new Blob([ab], { type: 'image/jpeg' });
          formData.append('image', blob, 'prescription.jpg');
        } catch (error) {
          console.error("Error processing image:", error);
          Swal.fire({
            title: "Error",
            text: "There was an error processing the image. Please try a different image.",
            icon: "error",
            confirmButtonColor: "#009900"
          });
          setLoading(false); // Stop loading if there's an error with the image
          return;
        }
      }
      
      // Log the form data entries for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      // Use the correct API endpoint from the config
      const response = await axios.post(
        apiConfig.endpoints.addPrescription,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      if (response.status === 201 || response.status === 200) {
        setLoading(false); // Stop loading on success
        Swal.fire({
          title: "Success!",
          text: "Thank you for submitting your prescription, we will contact you soon!",
          icon: "success",
          confirmButtonColor: "#009900", // Match page theme
        });
        setDescription("");
        setImage(null); // Reset the image after success
        
        // Reset the file input
        const fileInput = document.getElementById('prescription-image');
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      console.error("Error submitting prescription:", error);
      setLoading(false); // Stop loading on error
      
      // Extract and display more detailed error message
      let errorMessage = "There was an error submitting your prescription.";
      if (error.response && error.response.data) {
        console.log("Server error details:", error.response.data);
        
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        
        if (error.response.data.errors) {
          const errorDetails = Object.values(error.response.data.errors).flat().join("\n");
          errorMessage += "\n" + errorDetails;
        }
      }
      
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#009900", // Match page theme
      });
    }
  };  

  // Show loading spinner when loading is true
  if (loading) return <LoadingSpinner />;

  return (
    <div className="prescription-page">
      <Header />
      <NavBar />
      <div id="page-container">
        <form className="prescription-form" onSubmit={handleSubmit}>
          <h1>Upload a Prescription</h1>
          <div className="form-group">
            <label htmlFor="prescription-image">Upload Image:</label>
            <input
              type="file"
              id="prescription-image"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="prescription-description">Description:</label>
            <textarea
              id="prescription-description"
              className="prescription-textarea"
              placeholder="Write your prescription description here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
            ></textarea>
          </div>
          <button type="submit" className="prescription-button">
            Submit
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default Prescription;
