import React, { useState, useEffect } from 'react';
import web3 from '../../utils/web3';
import InventoryPayment from '../../contracts/InventoryPayment.json';

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productQty, setProductQty] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [inventoryContract, setInventoryContract] = useState(null);
  const [accounts, setAccounts] = useState([]);

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

  const handleAddProduct = async () => {
    try {
      
      await inventoryContract.methods.addProduct(productName, parseInt(productPrice), parseInt(productQty)).send({ from: accounts[0], gas: 5000000 });
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await inventoryContract.methods.deleteProduct(productId).send({ from: accounts[0] });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleUpdateProduct = async () => {
    try {
      await inventoryContract.methods.updateProduct(selectedProductId, productName, parseInt(productPrice), parseInt(productQty)).send({ from: accounts[0] });
      fetchProducts();
      resetForm();
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const selectProductForEdit = (product) => {
    setSelectedProductId(product.productId);
    setProductName(product.productName);
    setProductPrice(product.productPrice);
    setProductQty(product.productQty);
    setIsEditMode(true);
  };

  const resetForm = () => {
    setProductName('');
    setProductPrice('');
    setProductQty('');
    setSelectedProductId('');
    setIsEditMode(false);
  };
  return (
    <div>
      <h2>All Products</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.productId}>
              <td>{product.productName}</td>
              <td>{product.productPrice}</td>
              <td>{product.productQty}</td>
              <td>
                <button onClick={() => selectProductForEdit(product)}>Edit</button>
                <button onClick={() => handleDeleteProduct(product.productId)}>Delete</button>
              </td>
            </tr>
          ))}
          <tr>
            <td>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} />
            </td>
            <td>
              <input type="text" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
            </td>
            <td>
              <input type="text" value={productQty} onChange={(e) => setProductQty(e.target.value)} />
            </td>
            <td>
              {isEditMode ?
                <button onClick={handleUpdateProduct}>Update</button> :
                <button onClick={handleAddProduct}>Add</button>
              }
              <button onClick={resetForm}>Cancel</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
