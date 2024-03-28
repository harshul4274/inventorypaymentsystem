import React, { useState, useEffect } from 'react';
import web3 from '../../utils/web3';
import InventoryPayment from '../../contracts/InventoryPayment.json';


const ProductForm = () => {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productQty, setProductQty] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if(selectedProductId == ""){
        const gasEstimate = await inventoryContract.methods.addProduct(productName, parseInt(productPrice), parseInt(productQty)).estimateGas({ from: accounts[0] });
        const gasLimit = gasEstimate * 2;
        await inventoryContract.methods.addProduct(productName, parseInt(productPrice), parseInt(productQty)).send({ from: accounts[0], gas: gasLimit });
      }else{
        const gasEstimate = inventoryContract.methods.updateProduct(selectedProductId, productName, parseInt(productPrice), parseInt(productQty)).estimateGas({ from: accounts[0] });
        const gasLimit = gasEstimate * 2;
        await inventoryContract.methods.updateProduct(selectedProductId, productName, parseInt(productPrice), parseInt(productQty)).send({ from: accounts[0], gas: gasLimit });
      }
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const gasEstimate = await inventoryContract.methods.deleteProduct(productId).estimateGas({ from: accounts[0] });
      const gasLimit = gasEstimate * 2;
      await inventoryContract.methods.deleteProduct(productId).send({ from: accounts[0],gas: gasLimit });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const selectProductForEdit = (product) => {
    setSelectedProductId(product.productId);
    setProductName(product.productName);
    setProductPrice(product.productPrice);
    setProductQty(product.productQty);
  };

  const resetForm = () => {
    setProductName('');
    setProductPrice('');
    setProductQty('');
    setSelectedProductId('');
  };
  
  const filteredProducts = products.filter(product => product.productName !== null && product.productName !== "");

  return (
    <div className='table'>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <input type="text" className="form-control" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} />
        </div>
        <div className="mb-3">
          <input type="number" className="form-control" placeholder="Product Price" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
        </div>
        <div className="mb-3">
          <input type="number" className="form-control" placeholder="Product Quantity" value={productQty} onChange={(e) => setProductQty(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
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
          {filteredProducts.map(product => (
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
        </tbody>
        <tfoot>
          <tr>
            <th>Name</th>
            <th>Account Number</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
          </tfoot>
        </table>
    </div>
  );
};

export default ProductForm;
