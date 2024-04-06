// App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import AddBankDetailsForm from "./components/order/AddBankDetailsForm";
import ProductForm from "./components/order/ProductForm";
import OrderForm from "./components/order/OrderForm";
import Supplier from "./components/order/Supplier";
import HomeComponent from "./components/order/Home";
import QRCodeGenerator from "./components/order/QRCodeGenerator";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import 'bootstrap/dist/js/bootstrap.bundle.min';

const App = () => {
  const logoSrc = process.env.PUBLIC_URL + "/logo.png";
  return (
    <Router>
      <ToastContainer position="top-right" />
      <div className="App d-flex flex-column min-vh-100">
        <Header logoSrc={logoSrc} />
        <main className="flex-grow-1 p-3">
          <div className="container mt-5">
            <Routes>
              <Route path="/" element={<HomeComponent />} />
              <Route
                path="/bank"
                element={<AddBankDetailsForm />}
              />
              <Route path="/suppliers" element={<Supplier />} />
              <Route path="/products" element={<ProductForm />} />
              <Route path="/place-order" element={<OrderForm />} />
              <Route path="/qr-code" element={<QRCodeGenerator />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
