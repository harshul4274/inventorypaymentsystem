// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AddBankDetailsForm from './components/order/AddBankDetailsForm';
import ShowBankDetails from './components/order/ShowBankDetails';
import ProductForm from './components/order/ProductForm';
import OrderForm from './components/order/OrderForm';
import OrderDetails from './components/order/OrderDetails';
import Supplier from './components/order/Supplier';
import QRCodeGenerator from './components/order/QRCodeGenerator';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const App = () => {
  const logoSrc = process.env.PUBLIC_URL + '/logo.png';
  return (
    <Router>
      
      <ToastContainer position="top-right" />
      <div className="App d-flex flex-column min-vh-100">
        <Header logoSrc={logoSrc} />
        <main className="flex-grow-1 p-3">
          <Routes>
            <Route path="/add-bank-details" element={<AddBankDetailsForm />} />
            <Route path="/supplier" element={<Supplier />} />
            <Route path="/show-bank-details" element={<ShowBankDetails />} />
            <Route path="/add-product" element={<ProductForm />} />
            <Route path="/place-order" element={<OrderForm />} />
            <Route path="/order-details" element={<OrderDetails />} />
            <Route path="/qr-code" element={<QRCodeGenerator />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
