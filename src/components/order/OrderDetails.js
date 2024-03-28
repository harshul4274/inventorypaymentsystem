import React from 'react';

const OrderDetails = ({ order, products }) => {
  return (
    <div className="mt-4">
      <h2>Order Details</h2>
      <p>Order Number: {order.orderNo}</p>
      <p>Order Date: {new Date(order.orderDate * 1000).toLocaleDateString()}</p>
      <p>Total Amount: {order.orderTotalAmount}</p>
      <p>Order Status: {order.orderStatus ? 'Received' : 'Pending'}</p>
      <p>Products:</p>
      <ul>
        {Object.keys(order.orderDetails).map(productId => (
          <li key={productId}>{products[productId].productName} - Qty: {order.orderDetails[productId].productQtyOrder}</li>
        ))}
      </ul>
    </div>
  );
};

export default OrderDetails;
