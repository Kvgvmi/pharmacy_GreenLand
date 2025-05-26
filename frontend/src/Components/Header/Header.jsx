import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import img from "./logo-nobg.png";
import axios from "axios"; // To make API requests
import "./Header.css";

function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]); // For showing search suggestions
  const [loading, setLoading] = useState(false); // For loading spinner
  const navigate = useNavigate();

  const handleAccountClick = () => {
    const user = Cookies.get("user") || sessionStorage.getItem("user");
    navigate(user ? "/account" : "/login");
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?query=${searchTerm}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Fetch search suggestions when user types
  useEffect(() => {
    if (searchTerm.trim()) {
      setLoading(true);
      axios
        .get(`http://localhost:8081/products-search?search=${searchTerm}`)
        .then((res) => {
          setSuggestions(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching search suggestions:", err);
          setLoading(false);
        });
    } else {
      setSuggestions([]); // Clear suggestions if searchTerm is empty
    }
  }, [searchTerm]);

  return (
    <div id="Header">
      <Link to="/" id="Logo">
        <img src={img} alt="Logo" />
      </Link>

      <div id="SearchBar">
        <input
          id="SearchBarInput"
          placeholder="Search ..."
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown} // Trigger search on Enter key
          autoComplete="off"
        />
        <button id="buttonSearch" onClick={handleSearch}>
          <i className="fa fa-search"></i>
        </button>

        {/* Display Suggestions or Loading Indicator */}
        {loading ? (
          <div className="loading-indicator">Loading...</div> // You can replace this with a spinner if you have one
        ) : (
          suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.ID_PRODUCT}
                  className="suggestion-item"
                  onClick={() => {
                    navigate(`/product/${suggestion.ID_PRODUCT}`); // Navigate to the product page
                  }}
                >
                  {suggestion.NAME_PRODUCT}
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <div id="ButtonsContainer">
        <Link to="/contact-us" id="ContactUs">
          <i className="fa fa-phone"></i>
          <span className="ButtonText">Contact us</span>
        </Link>
        <Link to="/cart" id="Cart">
          <i className="fa fa-shopping-cart"></i>
          <span className="ButtonText">Cart</span>
        </Link>
        <button id="Account" onClick={handleAccountClick}>
          <i className="fa fa-user"></i>
          <span className="ButtonText">Account</span>
        </button>
      </div>
    </div>
  );
}

export default Header;
