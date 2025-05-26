import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SeeFeedbacks.css";
import apiConfig from "./config/api";

function SeeFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get(apiConfig.endpoints.feedbacks)
      .then((res) => {
        console.log('Feedback response:', res.data); // Debug log
        
        // Handle the new API response format (status + data structure)
        const feedbackData = res.data && res.data.data ? res.data.data : 
                          (Array.isArray(res.data) ? res.data : []);
        
        setFeedbacks(feedbackData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching feedbacks:", err);
        setError("Failed to load feedbacks. Please try again later.");
        setLoading(false);
        // Ensure feedbacks is an empty array on error
        setFeedbacks([]);
      });
  }, []);

  if (loading) return <div className="text-center mt-5">Loading feedbacks...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;

  return (
    <div id="feedbacks-page" className="d-flex flex-column align-items-center">
      <h1 id="feedbacks-title">User Feedbacks</h1>
      <div id="feedbacks-container" className="d-flex flex-wrap justify-content-center">
        {feedbacks && feedbacks.length > 0 ? (
          feedbacks.map((feedback, index) => (
            <div key={index} className="feedback-card">
              <h2 className="feedback-username">{feedback.username_user}</h2>
              <p className="feedback-city">City: {feedback.city_user}</p>
              <p className="feedback-phone">Phone: {feedback.phone_user}</p>
              <div className="feedback-text">
                <p>{feedback.text_feedback}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No feedbacks available at this time.</p>
        )}
      </div>
    </div>
  );
}

export default SeeFeedbacks;
