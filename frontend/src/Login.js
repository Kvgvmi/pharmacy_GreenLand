import React, { useState, useEffect } from "react";
import "./Login.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";
import Validation from "./LoginValidation.js";
import axios from "axios";
import Cookies from "js-cookie";

function Login() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const user = Cookies.get("user") 
      ? JSON.parse(Cookies.get("user")) 
      : sessionStorage.getItem("user") 
        ? JSON.parse(sessionStorage.getItem("user")) 
        : null;

    if (user) {
      navigate(user.isAdmin === "True" ? "/home-admin" : "/account");
    }
  }, [navigate]);

  const handleInput = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleCheckbox = (event) => {
    setRememberMe(event.target.checked);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = Validation(values);
    setErrors(validationErrors);
    setServerError("");
  
    if (!validationErrors.email && !validationErrors.password) {
      axios
        .post("http://localhost:8081/api/login", values)
        .then((res) => {
          const user = res.data.user;
  
          if (res.data.message === "User login successful") {
            console.log("User Info:", user);
            
            // Save user info in cookies or session storage
            if (rememberMe) {
              Cookies.set("user", JSON.stringify(user), { expires: 7 });
            } else {
              sessionStorage.setItem("user", JSON.stringify(user));
            }
  
            // Redirect based on isAdmin value
            navigate(user.isAdmin === "True" ? "/home-admin" : "/");
          } else {
            setServerError("Email or password are incorrect");
          }
        })
        .catch((err) => {
          console.log("Erreur de connexion:", err);
          if (err.response && err.response.data && err.response.data.message) {
            setServerError(err.response.data.message);
          } else {
            setServerError("Erreur de connexion au serveur. Veuillez réessayer.");
          }
        });
    }
  };
  
  const handleClose = () => {
    navigate("/");
  };

  return (
    <div
      id="LoginPage"
      className="d-flex justify-content-center align-items-center vh-100"
    >
      <div id="BackgroundBlur" />
      <form onSubmit={handleSubmit} id="LoginForm">
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={handleClose}
        />
        <h1 id="LoginText" className="text-center mb-4">
          Log in
        </h1>

        {serverError && (
          <div className="alert alert-danger" role="alert">
            {serverError}
          </div>
        )}

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
            required
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
            required
          />
          {errors.password && (
            <span className="text-danger">{errors.password}</span>
          )}
        </div>

        <div className="mb-3 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="rememberMe"
            checked={rememberMe}
            onChange={handleCheckbox}
          />
          <label className="form-check-label" htmlFor="rememberMe">
            Remind me later
          </label>
        </div>

        <button type="submit" className="btn btn-success w-100">
          Log in
        </button>
        <p className="mb-2 mt-2">Don't have an account?</p>
        <Link
          to="/signup"
          className="btn btn-outline-secondary w-100 text-decoration-none"
        >
          Sign up
        </Link>
      </form>
    </div>
  );
}

export default Login;