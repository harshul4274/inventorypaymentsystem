import QRCode from "qrcode.react";
import jsQR from "jsqr";
import axios from "axios";

import React, { useState, useEffect } from "react";
import web3 from "../../utils/web3";
import InventoryPayment from "../../contracts/InventoryPayment.json";
import { toast, ToastContainer } from "react-toastify";

function QRCodeGenerator() {
  const baseURL = process.env.REACT_APP_API_URL;
  const [inputData, setInputData] = useState("");
  const [qrData, setQrData] = useState("");


  const generateQRCode = () => {
    setQrData(inputData);
  };

  // const jsonData = {
  //   "orderNo": 1,
  //   "receivedProducts": [
  //     {
  //       "productId": 1,
  //       "productQtyOrder": 50,
  //       "productQtyReceived": 40,
  //       "productPrice": 20
  //     },
  //     {
  //       "productId": 2,
  //       "productQtyOrder": 50,
  //       "productQtyReceived": 40,
  //       "productPrice": 10
  //     }
  //   ]
  // }

  const handleReceivedOrder = async (orderNo, orderDetails) => {
    try {
      const receivedOrderProductDetails = JSON.stringify(orderDetails);

      const requestBody = {
        orderNo,
        receivedOrderProductDetails,
      };

      await axios.post(`${baseURL}/api/order/received`, requestBody);

      toast.success("Successfully Received Order");
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        try {
          const qrCode = jsQR(
            imageData.data,
            imageData.width,
            imageData.height
          );

          if (qrCode && qrCode.data) {
            const receivedOrderDetails = JSON.parse(qrCode.data);
            if (
              receivedOrderDetails.orderNo &&
              receivedOrderDetails.receivedProducts
            ) {
              handleReceivedOrder(
                receivedOrderDetails.orderNo,
                receivedOrderDetails.receivedProducts
              );
            }
          } else {
            console.error("No QR code found in the uploaded image.");
          }
        } catch (error) {
          console.error("Error parsing QR code data:", error);
          // Handle parsing error here, such as displaying an error message to the user
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input
        type="text"
        value={inputData}
        onChange={(e) => setInputData(e.target.value)}
      />
      <button onClick={generateQRCode}>Generate QR Code</button>
      {qrData && <QRCode value={qrData} />}
      <br />
      <hr />
      <input type="file" accept="image/*" onChange={handleFileUpload} />
    </div>
  );
}
export default QRCodeGenerator;
