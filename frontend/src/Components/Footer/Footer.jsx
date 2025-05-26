import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <div id="Footer">
      <div id="FooterText">
        <span>Client service : +212 500 000 000</span>
        <br />
        <span>Work hours : Monday to Saturday from 9h00 to 22h00</span>
      </div>
      <div id="FooterElements">
        <div className="FooterElements">
          <h3>Our products</h3>
          <Link to="/medicines">Medicines</Link>
          <br />
          <Link to="/best-sellers">Best sellers</Link>
          <br />
          <Link to="/supplements">Supplements</Link>
          <br />
          <Link to="/baby">Baby</Link>
          <br />
          <Link to="/bio">Bio</Link>
        </div>
        <div className="FooterElements">
          <h3>Know us</h3>
          <Link to="/contact-us">Contact us</Link>
          <br />
        </div>
        <div className="FooterElements">
          <h3>Your account</h3>
          <Link to="/personal-info">Personal informations</Link>
          <br />
          <Link to="/account">Your orders</Link>
        </div>
        <div id="Follow">
          <h3>Pharmacie GreenLand </h3>
          <div id="hr" />
          <h4>Follow us :</h4>
          <div id="Socials">
            <a href="https://instagram.com">
              <i className="fa fa-instagram"></i>
            </a>
            <a href="https://facebook.com">
              <i className="fa fa-facebook-official"></i>
            </a>
            <a href="https://whatsapp.com">
              <i className="fa fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>
      <div id="FooterCopyright">
        <span>
          <i className="fa fa-copyright"></i> 2024 Pharmacie GreenLand - All
          rights are reserved
        </span>
      </div>
    </div>
  );
}

export default Footer;
