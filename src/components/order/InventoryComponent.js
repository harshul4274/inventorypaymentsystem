// src/components/InventoryComponent.js
import React, { useEffect, useState } from 'react';
import web3 from '../../utils/web3';
import InventoryPayment from '../../contracts/InventoryPayment.json';
import ProductTable from './ProductTable';

const InventoryComponent = () => {
  const [accounts, setAccounts] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [inventoryContract, setInventoryContract] = useState(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      const accs = await web3.eth.getAccounts();
      setAccounts(accs);
    };

    fetchAccounts();
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
    const fetchProductCount = async () => {
      if (!inventoryContract) return;
      const count = await inventoryContract.methods.productCount().call();
      setProductCount(parseInt(count));
    };

    fetchProductCount();
  }, [inventoryContract]);

  const handleAddProduct = async () => {
    if (!inventoryContract) return;
    //await inventoryContract.methods.addProduct("testing", 100, 10).send({ from: accounts[0] });
    await inventoryContract.methods.addProduct("testing", 100, 10).send({ from: accounts[0], gas: 5000000 });

    const count = await inventoryContract.methods.productCount().call();
    setProductCount(parseInt(count));
  };

  return (
    <div>
      <h1>Accounts:</h1>
      <ul>
        {accounts.map(account => (
          <li key={account}>{account}</li>
        ))}
      </ul>
      <h1>Product List</h1>
      <ProductTable></ProductTable>
      <h1>Product Count: {productCount}</h1>
      <button onClick={handleAddProduct}>Add Product</button>
    </div>
  );
};

export default InventoryComponent;
