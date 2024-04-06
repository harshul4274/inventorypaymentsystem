// Header.js

import React from 'react';
import { Link } from 'react-router-dom';
import '../src/css/header.css';


const Header = ({ logoSrc }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light my-header">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img src={logoSrc} alt="Logo"/>
        </Link>
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link className="nav-link" to="/">Home</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/bank">Bank</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/suppliers">Supplier</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/products">Products</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/place-order">Order</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/qr-code">QR Code</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;
