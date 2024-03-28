import React, { useState, useEffect } from 'react';
import web3 from '../../utils/web3';
import InventoryPayment from '../../contracts/InventoryPayment.json';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ShowBankDetails = () => {
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    backupAmount: ''
  });

  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = InventoryPayment.networks[networkId];
        const contract = new web3.eth.Contract(
          InventoryPayment.abi,
          deployedNetwork && deployedNetwork.address
        );

        const result = await contract.methods.getBankDetails().call();
        setBankDetails({
          bankName: result.bankName,
          accountNumber: result.accountNumber,
          backupAmount: result.backupAmount
        });
      } catch (error) {
        console.error(error);
        toast.error(`Error: ${error.message}`);
      }
    };

    fetchBankDetails();
  }, []); // Empty dependency array to ensure the effect runs only once on mount

  return (
    <div className="mt-4">
      <h2>Bank Details</h2>
      <p>Bank Name: {bankDetails.bankName}</p>
      <p>Account Number: {bankDetails.accountNumber}</p>
      <p>Backup Amount: {bankDetails.backupAmount}</p>
    </div>
  );
};

export default ShowBankDetails;
