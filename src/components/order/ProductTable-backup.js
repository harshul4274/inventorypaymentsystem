import React, { useEffect, useState } from 'react';
import web3 from '../../utils/web3';
import InventoryPayment from '../../contracts/InventoryPayment.json';

const ProductTableBackup = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
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

    fetchProducts();
  }, []);

  return (
    <div>
      <h2>All Products</h2>
      <table>
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.productId}>
              <td>{product.productId}</td>
              <td>{product.productName}</td>
              <td>{product.productPrice}</td>
              <td>{product.productQty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTableBackup;
