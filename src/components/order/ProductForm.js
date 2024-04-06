import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const ProductForm = () => {
  const baseURL = process.env.REACT_APP_API_URL;
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productQty, setProductQty] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/getProducts`);
      const productsArray = response.data.data;
      setProducts(productsArray);
    } catch (error) {
      toast.error("Error fetching products:", error);
    }
  };

  const validateForm = () => {
    if (!productName.trim()) {
      toast.error("Product Name cannot be empty");
      return false;
    }
    if (!/^\d+$/.test(productPrice) || productPrice <= 0) {
      toast.error("Product price must be numeric and greter then 0");
      return false;
    }

    if (!/^\d+$/.test(productQty) || productQty <= 0) {
      toast.error("Product qty must be numeric and greter then 0");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requestBody = {
      productName,
      productPrice,
      productQty,
    };
    try {
      if (!validateForm()) {
        return;
      }
      if (selectedProductId == "") {
        await axios.post(`${baseURL}/api/add/product`, requestBody);
        toast.success("Product inserted successfully.");
      } else {
        await axios.put(
          `${baseURL}/api/update/product/${selectedProductId}`,
          requestBody
        );
        toast.success("Product updated successfully.");
      }
      fetchProducts();
      resetForm();
    } catch (error) {
      toast.error("Error adding product:", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this product?"
      );
      if (!isConfirmed) {
        return;
      }
      await axios.delete(`${baseURL}/api/product/${productId}`);
      toast.success("Product deleted successfully.");
      fetchProducts();
    } catch (error) {
      toast.error("Error deleting product:", error);
    }
  };

  const selectProductForEdit = (product) => {
    setSelectedProductId(product[0]);
    setProductName(product[1]);
    setProductPrice(product[2]);
    setProductQty(product[3]);
  };

  const resetForm = () => {
    setProductName("");
    setProductPrice("");
    setProductQty("");
    setSelectedProductId("");
  };

  const filteredProducts = products.filter(
    (product) => product[1] !== null && product[1] !== ""
  );

  return (
    <div className="custom">
      <div className="row justify-content-center">
        <div className="col-5">
          <div className="custom-form p-4 row">
            <h2 className="header-title">Product Form</h2>{" "}
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Product Name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Product Quantity"
                  value={productQty}
                  onChange={(e) => setProductQty(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Product Price"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
              <button
                type="reset"
                className="btn btn-danger mx-2"
                onClick={resetForm}
              >
                Reset
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12 table-container">
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead className="thead-dark">
                <tr>
                  <th colSpan={4}>
                    <h2>Product Details</h2>
                  </th>
                </tr>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product[0]}>
                    <td>{product[1]}</td>
                    <td>{product[2]}</td>
                    <td>{product[3]}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => selectProductForEdit(product)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      {/* <button className="btn btn-danger btn-sm mx-2"onClick={() => handleDeleteProduct(product[0])}><FontAwesomeIcon icon={faTrashAlt} /></button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
