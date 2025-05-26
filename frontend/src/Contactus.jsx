import React, { useState } from "react";
import Header from "./Components/Header/Header";
import NavBar from "./Components/NavBar/NavBar";
import Footer from "./Components/Footer/Footer";
import axios from "axios"; // Import axios for making API requests
import Cookies from "js-cookie"; // Assuming you're using cookies for user authentication
import "./Contactus.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import apiConfig from "./config/api"; // Import API configuration

function ContactUs() {
  const [feedback, setFeedback] = useState(""); // State to hold the feedback text
  const navigate = useNavigate(); // Initialize navigate

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    // Check if feedback is empty
    if (!feedback.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Please enter a message to submit your feedback.",
        icon: "error",
        confirmButtonColor: "#009900",
      });
      return; // Stop the function if feedback is empty
    }

    const user = Cookies.get("user") || sessionStorage.getItem("user");
    if (!user) {
      Swal.fire({
        title: "Error",
        text: "You must be logged in to submit a Feedback.",
        icon: "error",
        confirmButtonColor: "#009900", // Match page theme
      });

      setTimeout(() => {
        navigate("/login");
      }, 1000);
      return;
    }

    const userData = JSON.parse(user);
    const userId = userData.id;

    try {
      // Use the correct API endpoint from apiConfig
      const response = await axios.post(
        apiConfig.endpoints.submitFeedback,
        {
          id_user: userId,
          text_feedback: feedback,
        }
      );

      if (response.status === 201) {
        Swal.fire({
          title: "Success!",
          text: "Feedback submitted successfully!",
          icon: "success",
          confirmButtonColor: "#009900",
          backdrop: true,
          timer: 3000,
          timerProgressBar: true,
        });
        setFeedback(""); // Clear the textarea
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Swal.fire({
        title: "Error!",
        text: "There was an error submitting your feedback.",
        icon: "error",
        confirmButtonColor: "#009900",
      });
    }
  };

  return (
    <div className="contactus-page">
      <Header />
      <NavBar />
      <div className="page-container">
        <div className="contactus-container">
          <h1>Contact Us</h1>
          <div className="contactus-info">
            {/* Address, Phone, Email, Business Hours sections */}
            <div className="contactus-section">
              <h2>Address</h2>
              <div className="contactus-info-item">
                <p>Agadir</p>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="address-icon"
                >
                  <i className="fa fa-map-marker"></i>
                </a>
              </div>
            </div>
            <div className="contactus-section">
              <h2>Phone</h2>
              <p>+212 500 000 000</p>
            </div>
            <div className="contactus-section">
              <h2>Email</h2>
              <p>pharmcacigreenland@gmail.com</p>
            </div>
            <div className="contactus-section">
              <h2>Business Hours</h2>
              <p>Monday - Friday : 8:00 AM - 6:00 PM</p>
              <p>Saturday : 10:00 AM - 6:00 PM</p>
              <p>Sunday : Closed</p>
            </div>
          </div>
        </div>
        <form className="feedback-container" onSubmit={handleFeedbackSubmit}>
          <h1>Feedback</h1>
          <textarea
            className="feedback-textarea"
            placeholder="Write your feedback here..."
            rows="5"
            value={feedback} // Bind textarea value to state
            onChange={(e) => setFeedback(e.target.value)} // Update state on change
          ></textarea>
          <button type="submit" className="feedback-button">
            Submit
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default ContactUs;
