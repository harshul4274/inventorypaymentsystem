import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import { Badge } from "react-bootstrap";

const PlaceOrder = () => {
  const baseURL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});
  const [orderDetails, setOrderDetails] = useState([]);
  const [bankDetails, setBankDetails] = useState([]);
  const [supplierDetails, setSupplierDetails] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchOrderNumbers();
    fetchBankDetails();
    fetchSupplierDetails();
  }, []);

  const handleChange = (event) => {
    setSelectedSupplierId(event.target.value);
  };

  const fetchBankDetails = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/bankDetails`);
      setBankDetails(response.data.data);
    } catch (error) {
      toast.error("Error fetching bank details:", error.message);
    }
  };

  const fetchSupplierDetails = async () => {
    try {
      const supplierDetailsObj = await axios.get(
        `${baseURL}/api/getSupplierDetails`
      );
      setSupplierDetails(supplierDetailsObj.data.data);
    } catch (error) {
      toast.error("Error fetching supplier details:", error.message);
    }
  };

  let filteredSupplierDetails = [];
  let filteredBankDetails = [];

  if (supplierDetails.length > 0) {
    filteredSupplierDetails = supplierDetails.filter(
      (supplier) => supplier[1] !== ""
    );
  }

  if (bankDetails.length > 0) {
    filteredBankDetails = bankDetails.filter((item) => item[1] !== "");
  }

  const fetchOrderNumbers = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/order/details`);
      const orderDetailsObject = response.data.data;
      setOrderDetails(orderDetailsObject);
    } catch (error) {
      toast.error("Error fetching products:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/getProducts`);
      const productsArray = response.data.data;
      setProducts(productsArray);
    } catch (error) {
      toast.error("Error fetching products:", error);
    }
  };

  const handleProductSelection = (productId, event) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      const updatedProducts = selectedProducts.filter((id) => id !== productId);
      setSelectedProducts(updatedProducts);
    }
  };

  const handleQuantityChange = (productId, event) => {
    const quantity = parseInt(event.target.value);
    if (quantity > 0) {
      setProductQuantities({ ...productQuantities, [productId]: quantity });
    } else {
      toast.warning("Quantity must be greater than 0.");
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;

    return `${formattedDay}/${formattedMonth}/${year}`;
  };

  const numberWithCommas = (number) => {
    return number.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  };

  const validateForm = () => {
    if (!selectedSupplierId.trim()) {
      toast.error("Please select supplier");
      return false;
    }

    if (
      Object.values(productQuantities).length <= 0 ||
      selectedProducts.length <= 0
    ) {
      toast.error("Please select and enter the proper product qty.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!validateForm()) {
        return;
      }
      let supplierId = selectedSupplierId;
      const productQty = Object.values(productQuantities);
      const requestBody = {
        selectedProducts,
        productQty,
        supplierId,
      };

      await axios.post(`${baseURL}/api/place/order`, requestBody);

      toast.success("Order Placed Successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      // Clear selected products and quantities after placing order
      setSelectedProducts([]);
      setProductQuantities({});
      fetchOrderNumbers();
    }
  };

  const filteredProducts = products.filter(
    (product) => product[1] !== null && product[1] !== ""
  );

  const handleClick = (routeName) => {
    if (routeName == "bank") {
      navigate("/bank");
    } else if (routeName == "supplier") {
      navigate("/suppliers");
    } else {
      navigate("/products");
    }
  };

  return (
    <div className="custom">
      <div className="row justify-content-center">
        <div className="col-8">
          <div className="custom-form p-4 row">
            <h2 className="header-title">Place Order Form</h2>
            {filteredProducts.length > 0 &&
            filteredBankDetails.length > 0 &&
            filteredSupplierDetails.length > 0 ? (
              <form onSubmit={handleSubmit}>
                <div className="col-12 order-table-container">
                  <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                      <thead className="thead-dark">
                        <tr key="0">
                          <th colSpan={4}>
                            <h4>Supplier Details</h4>
                          </th>
                        </tr>
                        <tr key="1">
                          <td key={5} colSpan={3}>
                            <select
                              className="form-control"
                              value={selectedSupplierId}
                              onChange={handleChange}
                            >
                              <option value="">Select Supplier</option>
                              {filteredSupplierDetails.map((supplier) => (
                                <option key={supplier[0]} value={supplier[0]}>
                                  {supplier[1]}
                                </option>
                              ))}
                              ;
                            </select>
                          </td>
                        </tr>
                        <tr key="2">
                          <th colSpan={4}>
                            <h4>Product Details</h4>
                          </th>
                        </tr>
                        <tr key="4">
                          <th>#</th>
                          <th>Product Name</th>
                          <th>Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => (
                          <tr key={product[0]}>
                            <td>
                              <input
                                type="checkbox"
                                onChange={(e) =>
                                  handleProductSelection(product[0], e)
                                }
                              />
                            </td>
                            <td> {product[1]}</td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                value={productQuantities[product[0]] || ""}
                                onChange={(e) =>
                                  handleQuantityChange(product[0], e)
                                }
                                disabled={
                                  !selectedProducts.includes(product[0])
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">
                  Place Order
                </button>
              </form>
            ) : filteredBankDetails.length <= 0 ? (
              <div className="row p-4">
                <h5> Please add the bank</h5>
                <h6>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleClick("bank")}
                  >
                    Add Bank Details
                  </button>
                </h6>
              </div>
            ) : filteredSupplierDetails.length <= 0 ? (
              <div className="row p-4">
                <h5> Please add the supplier</h5>
                <h6>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleClick("supplier")}
                  >
                    Add Supplier Details
                  </button>
                </h6>
              </div>
            ) : filteredProducts.length <= 0 ? (
              <div className="row p-4">
                <h5> Please add the products</h5>
                <h6>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleClick("product")}
                  >
                    Add Product
                  </button>
                </h6>
              </div>
            ) : null}
            {/* Display order details */}
            {orderDetails.length > 0 && (
              <div className="row">
                <div className="col-12 table-container">
                  <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                      <thead className="thead-dark">
                        <tr>
                          <th>Order No</th>
                          <th>Order Date</th>
                          <th>Total Amount</th>
                          <th>Status</th>
                          <th>Supplier ID</th>
                          <th>Product IDs</th>
                          <th>Product Quantities</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetails.map((order) => (
                          <tr key={order.orderNo}>
                            <td>{order.orderNo}</td>
                            <td>{formatDate(order.orderDate)}</td>
                            <td>
                              &#8377; {numberWithCommas(order.orderTotalAmount)}
                            </td>
                            <td>
                              {order.orderStatus === "placed" ? (
                                <Badge className="bg-warning">Placed</Badge>
                              ) : order.orderStatus == "received" ? (
                                <Badge className="bg-success">Received</Badge>
                              ) : (
                                <>{order.orderStatus}</>
                              )}
                            </td>
                            <td>{order.supplierId}</td>
                            <td>{order.productIds.join(", ")}</td>
                            <td>{order.productQtys.join(", ")}</td>
                            <td>
                              <button className="btn btn-primary btn-sm">
                                <FontAwesomeIcon icon={faEye} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
