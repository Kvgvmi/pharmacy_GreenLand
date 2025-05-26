import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

function NavBar() {
  return (
    <div id='NavBar'>
      <Link to='/' className='NavBarElements'><i className='fa fa-home'></i></Link>
      <Link to='/products' className='NavBarElements'>Our products</Link>
      <Link to='/medicines' className='NavBarElements'>Medicines</Link>
      <Link to='/supplements' className='NavBarElements'>Supplements</Link>
      <Link to='/bio' className='NavBarElements'>Bio</Link>
      <Link to='/baby' className='NavBarElements'>Baby</Link>
      <Link to='/best-sellers' className='NavBarElements'>Best sellers</Link>
      <Link to='/new-products' className='NavBarElements'>New products</Link>
      <Link to='/prescriptions' className='NavBarElements'>Prescriptions</Link>
    </div>
  );
}

export default NavBar;
