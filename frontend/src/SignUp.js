import React, { useState } from "react";
import "./SignUp.css";
import { Link, useNavigate } from "react-router-dom";
import Validation from "./SignupValidation";
import axios from "axios";
import backgroundImage from "./Components/Content/Images/img1.png";

function SignUp() {
  const [values, setValues] = useState({
    username: "",
    phone: "",
    city: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = Validation(values);
    setErrors(validationErrors);
    setServerError("");

    if (!Object.values(validationErrors).some((error) => error !== "")) {
      axios
        .post("http://localhost:8000/api/signup", values)
        .then((response) => {
          console.log("Inscription réussie:", response.data);
          navigate("/login");
        })
        .catch((err) => {
          console.log("Erreur d'inscription:", err);
          if (err.response && err.response.data && err.response.data.error) {
            setServerError("Erreur: " + Object.values(err.response.data.error).join(", "));
          } else {
            setServerError("Erreur de connexion au serveur. Veuillez réessayer.");
          }
        });
    }
  };

  const handleClose = () => {
    navigate("/"); // Navigate to home page
  };

  return (
    <div id="SignupContainer">
      <div id="BackgroundBlur" />
      <form onSubmit={handleSubmit} id="SignupForm">
        <button type="button" className="btn-close" aria-label="Close" onClick={handleClose} />
        <h1 id="SignupText" className="text-center mb-4">
          Sign up
        </h1>
        
        {serverError && (
          <div className="alert alert-danger" role="alert">
            {serverError}
          </div>
        )}
        
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            <strong>Username</strong>
          </label>
          <input
            type="text"
            className="form-control"
            name="username"
            id="usernameInput"
            placeholder="Enter your username ..."
            onChange={handleInput}
          />
          {errors.username && (
            <span className="text-danger">{errors.username}</span>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="phone" className="form-label">
            <strong>Phone number</strong>
          </label>
          <input
            type="text"
            className="form-control"
            name="phone"
            id="phoneNumberInput"
            placeholder="Enter your phone number ..."
            onChange={handleInput}
          />
          {errors.phone && <span className="text-danger">{errors.phone}</span>}
        </div>

        <div className="mb-3">
          <label htmlFor="city" className="form-label">
            <strong>City</strong>
          </label>
          <input
            type="text"
            className="form-control"
            name="city"
            id="cityInput"
            placeholder="Enter your city ..."
            onChange={handleInput}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            <strong>Email</strong>
          </label>
          <input
            type="email"
            className="form-control"
            name="email"
            id="emailInput"
            placeholder="Enter your email ..."
            onChange={handleInput}
          />
          {errors.email && <span className="text-danger">{errors.email}</span>}
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            <strong>Password</strong>
          </label>
          <input
            type="password"
            className="form-control"
            name="password"
            id="passwordInput"
            placeholder="Enter your password ..."
            onChange={handleInput}
          />
          {errors.password && (
            <span className="text-danger">{errors.password}</span>
          )}
        </div>
        <button type="submit" className="btn btn-success w-100 mt-1 mb-1">
          Sign up
        </button>
        <p className="mb-2 mt-2">Already have an account?</p>
        <Link
          to="/login"
          className="btn btn-outline-secondary w-100 text-decoration-none"
        >
          Log in
        </Link>
      </form>
    </div>
  );
}

export default SignUp;