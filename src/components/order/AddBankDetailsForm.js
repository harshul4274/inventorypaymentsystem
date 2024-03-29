import React, { useState, useEffect } from 'react';
import web3 from '../../utils/web3';
import InventoryPayment from '../../contracts/InventoryPayment.json';

import { toast, ToastContainer } from 'react-toastify';

const AddBankDetailsForm = () => {
  const [bankDetails, setBankDetails] = useState([]);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [backupAmount, setBackupAmount] = useState('');
  
  const [selectedBankId, setSelectedBankId] = useState('');

  const [inventoryContract, setInventoryContract] = useState(null);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetchBankDetails();
  }, []);

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

  const fetchBankDetails = async () => {
    
    try {
      await initContract();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = InventoryPayment.networks[networkId];
      const contract = new web3.eth.Contract(
        InventoryPayment.abi,
        deployedNetwork && deployedNetwork.address
      );
      const bankDetailsObj = await contract.methods.getBankDetails().call();
      resetForm();
      setBankDetails(bankDetailsObj);
    } catch (error) {
      console.log(error);
      toast.error('Error fetching bank details:', error.message);
    }finally{
      resetForm();
    }
  };
  

  const handleAddBankDetails = async (e) => {
    e.preventDefault();
    try {
      if(selectedBankId == ''){
        const gasEstimate = await inventoryContract.methods.addUserBankDetails(bankName, accountNumber, backupAmount).estimateGas({ from: accounts[0] });
        const gasLimit = gasEstimate * 2;
        await inventoryContract.methods.addUserBankDetails(bankName, accountNumber, backupAmount).send({ from: accounts[0], gas: gasLimit });
      }else{
        const gasEstimate = await inventoryContract.methods.updateBank(selectedBankId,bankName, accountNumber, backupAmount).estimateGas({ from: accounts[0] });
        const gasLimit = gasEstimate * 2;
        await inventoryContract.methods.updateBank(selectedBankId,bankName, accountNumber, backupAmount).send({ from: accounts[0], gas: gasLimit });
      }
      fetchBankDetails();      
    } catch (error) {
      toast.error(error.message);
    }finally{
      resetForm();
    }
  };

  const handleDeleteBank = async (bankId) => {
    try {
      const gasEstimate = await inventoryContract.methods.deleteBank(bankId).estimateGas({ from: accounts[0] });
      const gasLimit = gasEstimate * 2;
      await inventoryContract.methods.deleteBank(bankId).send({ from: accounts[0],gas: gasLimit });
      fetchBankDetails();
    } catch (error) {
      toast.error(error.message);
    }finally{
      resetForm();
    }
  };
  
  const selectBankForEdit = (bank) => {
    setSelectedBankId(bank.id);
    setBankName(bank.bankName);
    setAccountNumber(bank.bankAccountNumber);
    setBackupAmount(bank.backupAmount);
  };

  const resetForm = () => {
    setBankName('');
    setAccountNumber('');
    setBackupAmount('');
    setSelectedBankId('');
  }

  return (
    <div className='table'>
      <form onSubmit={handleAddBankDetails} className="mt-4">
      <div className="mb-3">
          <input type="hidden" className="form-control" placeholder="Bank Id" value={selectedBankId} onChange={(e) => setSelectedBankId(e.target.value)}/>
        </div>
        <div className="mb-3">
          <input type="text" className="form-control" placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
        </div>
        <div className="mb-3">
          <input type="number" className="form-control" placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
        </div>
        <div className="mb-3">
          <input type="number" className="form-control" placeholder="Backup Amount" value={backupAmount} onChange={(e) => setBackupAmount(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">Add Bank Details</button>
      </form>
    
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Account Number</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bankDetails.map(bank => (
            <tr key={bank.id}>
              <td>{bank.bankName}</td>
              <td>{bank.bankAccountNumber}</td>
              <td>{bank.backupAmount}</td>
              <td>
                <button onClick={() => selectBankForEdit(bank)}>Edit</button>
                <button onClick={() => handleDeleteBank(bank.id)}>Delete</button>
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

export default AddBankDetailsForm;
