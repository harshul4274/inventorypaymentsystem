import QRCode from "qrcode.react";
import jsQR from "jsqr";

import React, { useState, useEffect } from 'react';
import web3 from '../../utils/web3';
import InventoryPayment from '../../contracts/InventoryPayment.json';
import { toast, ToastContainer } from 'react-toastify';

function QRCodeGenerator() {
    const [inputData, setInputData] = useState("");
    const [qrData, setQrData] = useState("");
    const [uploadedQRData, setUploadedQRData] = useState("");
    const [inventoryContract, setInventoryContract] = useState(null);
    const [accounts, setAccounts] = useState([]);
  
  
    useEffect(() => {
      initContract();
    }, []);
    
    const initContract = async () => {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = InventoryPayment.networks[networkId];
      const contract = new web3.eth.Contract(
        InventoryPayment.abi,
        deployedNetwork && deployedNetwork.address
      );
      setInventoryContract(contract);
    };

    useEffect(() => {
      const fetchAccounts = async () => {
        const accs = await web3.eth.getAccounts();
        setAccounts(accs);
      };
  
      fetchAccounts();
    }, []);

    const generateQRCode = () => {
        setQrData(inputData);
    };

    const jsonData = {
      "orderNo": 3,
      "receivedProducts": [
        {
          "productId": 1,
          "productQtyOrder": 60,
          "productQtyReceived": 60,
          "productPrice": 10,
        },
        {
          "productId": 2,
          "productQtyOrder": 60,
          "productQtyReceived": 60,
          "productPrice": 10,
        }
      ]
    };

    const handleReceivedOrder = async (orderNo,orderDetails) => {
        try {
            // const gasEstimate = await inventoryContract.methods.receiveOrder(orderNo, orderDetails).estimateGas({ from: accounts[0] });
            // const gasLimit = gasEstimate * 2;
            // await inventoryContract.methods.receiveOrder(orderNo, orderDetails).send({ from: accounts[0], gas: gasLimit });
            // toast.success("Successfully Received Order");
            
            const gasEstimate = await inventoryContract.methods.receiveOrder(jsonData.orderNo, jsonData.receivedProducts).estimateGas({ from: accounts[0] });
            console.log(gasEstimate);
            const gasLimit = gasEstimate * 2;
            await inventoryContract.methods.receiveOrder(jsonData.orderNo, jsonData.receivedProducts).send({ from: accounts[0], gas: gasLimit });
            toast.success("Successfully Received Order");

        } catch (error) {
            console.log(error);
            toast.error(error.message);
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

            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

            if (qrCode) {
                const receivedOrderDetails = qrCode.data;
                handleReceivedOrder(receivedOrderDetails.orderNo,receivedOrderDetails.products);
                console.log(receivedOrderDetails);
                setUploadedQRData(qrCode.data);
            } else {
                console.error("No QR code found in the uploaded image.");
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
      {uploadedQRData && (
        <div>
          <p>Uploaded QR Code Data: {uploadedQRData}</p>
        </div>
      )}
    </div>
  );
}
export default QRCodeGenerator;
