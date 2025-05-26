import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SeePrescriptions.css"; // Import your CSS file
import apiConfig from "./config/api";

function SeePrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(apiConfig.endpoints.userPrescriptions);
        // Ensure prescriptions is always an array - handle the nested structure from the API
        const responseData = response.data;
        // Check if the data is in the expected format with a data property (API returns {status, data})
        const prescriptionsData = responseData && responseData.data ? responseData.data : 
                                (Array.isArray(responseData) ? responseData : []);
        setPrescriptions(prescriptionsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
        setError("Failed to load prescriptions. Please try again later.");
        setLoading(false);
        // Ensure prescriptions is an empty array on error
        setPrescriptions([]);
      }
    };

    fetchPrescriptions();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading prescriptions...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;

  return (
    <div id="prescriptions-page-container" className="d-flex flex-column align-items-center">
      <h1 id="prescriptions-page-title">User Prescriptions</h1>
      <div id="prescriptions-cards-container" className="d-flex flex-wrap justify-content-center">
        {prescriptions && prescriptions.length > 0 ? (
          prescriptions.map((prescription, index) => (
            <div key={prescription.id_prescription || index} className="prescription-card card m-3" style={{ width: "18rem" }}>
              <div className="card-body">
                <h5 className="card-title">Username: {prescription.username_user}</h5>
                <p className="card-text">City: {prescription.city_user}</p>
                <p className="card-text">Phone: {prescription.phone_user}</p>
                <a
                  href={`data:image/jpeg;base64,${prescription.image_prescription}`}
                  download={`prescription_${prescription.id_prescription}.jpg`}
                  className="btn btn-info"
                >
                  Download Prescription
                </a>
                {prescription.image_prescription && (
                  <img
                    src={`data:image/jpeg;base64,${prescription.image_prescription}`}
                    alt="Prescription"
                    className="img-fluid mt-2"
                  />
                )}
                <p className="card-text mt-2">{prescription.description_prescription}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No prescriptions available at this time.</p>
        )}
      </div>
    </div>
  );
}

export default SeePrescriptions;
