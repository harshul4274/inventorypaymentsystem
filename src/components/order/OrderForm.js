import React, { useState, useEffect } from 'react';
import web3 from '../../utils/web3';
import InventoryPayment from '../../contracts/InventoryPayment.json';

const PlaceOrder = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});
  const [inventoryContract, setInventoryContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);

  useEffect(() => {
    fetchProducts();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const gasEstimate = await inventoryContract.methods.placeOrder(selectedProducts, Object.values(productQuantities)).estimateGas({ from: accounts[0] });
      const gasLimit = gasEstimate * 2;
      await inventoryContract.methods.placeOrder(selectedProducts, Object.values(productQuantities)).send({ from: accounts[0], gas: gasLimit });

      // Fetch order details from the smart contract
      const orderCount = await inventoryContract.methods.getOrderCount().call({ from: accounts[0] });
      const newOrder = await inventoryContract.methods.orders(orderCount - 1).call({ from: accounts[0] });
      setOrderDetails([...orderDetails, newOrder]);
      
      // Clear selected products and quantities after placing order
      setSelectedProducts([]);
      setProductQuantities({});
    } catch (error) {
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
          <ul>
            {orderDetails.map((order, index) => (
              <li key={index}>
                Order ID: {order.orderId} - Products: {order.products.join(', ')} - Quantities: {order.quantities.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;
