import React, { useState, useEffect } from 'react';
import web3 from '../../utils/web3';
import InventoryPayment from '../../contracts/InventoryPayment.json';
import { toast, ToastContainer } from 'react-toastify';

const PlaceOrder = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});
  const [inventoryContract, setInventoryContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);

  useEffect(() => {
    console.log("fetchProducts calling");
    fetchProducts();
    console.log("fetchOrderNumbers calling");
    fetchOrderNumbers();
  }, []);

  useEffect(() => {
    const initContract = async () => {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = InventoryPayment.networks[networkId];
      const contract = new web3.eth.Contract(
        InventoryPayment.abi,
        deployedNetwork && deployedNetwork.address
      );
      setInventoryContract(contract);
    };

    initContract();
  }, []);

  useEffect(() => {
    const fetchAccounts = async () => {
      const accs = await web3.eth.getAccounts();
      setAccounts(accs);
    };

    fetchAccounts();
  }, []);

  const fetchOrderNumbers = async () => {
    try {
      const networkId = await web3.eth.net.getId();
      const accs = await web3.eth.getAccounts();
      const deployedNetwork = InventoryPayment.networks[networkId];
      const contract = new web3.eth.Contract(
        InventoryPayment.abi,
        deployedNetwork && deployedNetwork.address
      );

      const orderCount = await contract.methods.getPlacedOrderNumbers(accs[0]).call();
      console.log(orderCount);
      const orderDetailsObject =[];
      for (let i=0;i<orderCount.length;i++){
        console.log(i,orderCount[i]);
        const orderDetails = await contract.methods.getOrderDetails(accs[0],orderCount[i]).call();
        
        orderDetailsObject.push(orderDetails);
      }
      console.log(orderDetailsObject);
      setOrderDetails(orderDetailsObject);
      // 
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  const fetchProducts = async () => {
    try {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = InventoryPayment.networks[networkId];
      const contract = new web3.eth.Contract(
        InventoryPayment.abi,
        deployedNetwork && deployedNetwork.address
      );

      const productCount = await contract.methods.productCount().call();
      const productsArray = [];
      for (let i = 1; i <= productCount; i++) {
        const product = await contract.methods.products(i).call();
        productsArray.push(product);
      }
      setProducts(productsArray);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleProductSelection = (productId, event) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      const updatedProducts = selectedProducts.filter(id => id !== productId);
      setSelectedProducts(updatedProducts);
    }
  };

  const handleQuantityChange = (productId, event) => {
    const quantity = parseInt(event.target.value);
    setProductQuantities({ ...productQuantities, [productId]: quantity });
  };
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-based
    const year = date.getFullYear();
  
    // Add leading zeros if necessary
    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;
  
    return `${formattedDay}/${formattedMonth}/${year}`;
  };

  const numberWithCommas = (number) => {
    return number.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    //return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const gasEstimate = await inventoryContract.methods.placeOrder(selectedProducts, Object.values(productQuantities),1).estimateGas({ from: accounts[0] });
      const gasLimit = gasEstimate * 2;
      await inventoryContract.methods.placeOrder(selectedProducts, Object.values(productQuantities),1).send({ from: accounts[0], gas: gasLimit });

      // // Fetch order details from the smart contract
      // const orderCount = await inventoryContract.methods.getOrderCount().call({ from: accounts[0] });
      // const newOrder = await inventoryContract.methods.orders(orderCount - 1).call({ from: accounts[0] });
      // setOrderDetails([...orderDetails, newOrder]);
      
      // Clear selected products and quantities after placing order
      setSelectedProducts([]);
      setProductQuantities({});
      fetchOrderNumbers();
    } catch (error) {
      toast.error(error.message);
      console.error('Error placing order:', error);
    }
  };
  const filteredProducts = products.filter(product => product.productName !== null && product.productName !== "");
  return (
    <div>
      <h2>Place Order</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <h3>Available Products</h3>
          <ul>
            {filteredProducts.map(product => (
              <li key={product.productId}>
                <input type="checkbox" onChange={(e) => handleProductSelection(product.productId, e)} /> {product.productName}
                <input type="number" value={productQuantities[product.productId] || ''} onChange={(e) => handleQuantityChange(product.productId, e)} disabled={!selectedProducts.includes(product.productId)} />
              </li>
            ))}
          </ul>
        </div>
        <button type="submit">Place Order</button>
      </form>

      {/* Display order details */}
      {orderDetails.length > 0 && (
        <div>
          <h3>Order Details</h3>
          <table>
            <thead>
              <tr>
                <th>Order No</th>
                <th>Order Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Supplier ID</th>
                <th>Product IDs</th>
                <th>Product Quantities</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.map(order => (
                <tr key={order.orderNo}>
                  <td>{order.orderNo}</td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td>&#8377; {numberWithCommas(order.orderTotalAmount)}</td>
                  <td>{order.orderStatus}</td>
                  <td>{order.supplierId}</td>
                  <td>{order.productIds.join(', ')}</td>
                  <td>{order.productQtys.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;
