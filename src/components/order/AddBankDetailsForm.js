import React, { useState, useEffect } from 'react';
import axios from 'axios';
import web3 from '../../utils/web3';
import InventoryPayment from '../../contracts/InventoryPayment.json';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

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
      const isConfirmed = window.confirm('Are you sure you want to delete this bank?');
      if (!isConfirmed) {
        return; // Do nothing if user cancels
      }
      const gasEstimate = await inventoryContract.methods.deleteBank(bankId).estimateGas({ from: accounts[0] });
      const gasLimit = gasEstimate * 2;
      await inventoryContract.methods.deleteBank(bankId).send({ from: accounts[0],gas: gasLimit });
      fetchBankDetails();
    } catch (error) {
      toast.error(error.message);
    } finally {
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

  const filteredBankDetails = bankDetails.filter(item => item[1] !== "");
  return (
    <div className="custom">
      <div className='row justify-content-center'>
        <div className='col-6'>
          <div className='custom-form p-4 row'>
            <h2 className="header-title">Bank Form</h2>
            <form onSubmit={handleAddBankDetails} className="mt-4">
            <div className="mb-3">
              <input type="hidden" className="form-control" placeholder="Bank Id" value={selectedBankId} onChange={(e) => setSelectedBankId(e.target.value)}/>
            </div>
            <div className="mb-3">
              <input type="text" className="form-control" placeholder="Name" value={bankName} onChange={(e) => setBankName(e.target.value)}/>
            </div>
            <div className="mb-3">
              <input type="number" className="form-control" placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}/>
            </div>
            <div className="mb-3">
              <input type="number" className="form-control" placeholder="Amount" value={backupAmount} onChange={(e) => setBackupAmount(e.target.value)}/>
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>              
              <button type="reset" className="btn btn-danger mx-2" onClick={resetForm}>
                Reset
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className='row'> 
        <div className='col-12 table-container'>
          <div className="table-responsive">
            <table className='table table-striped table-bordered'>
              <thead className="thead-dark">
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
                      <button className="btn btn-primary btn-sm" onClick={() => selectBankForEdit(bank)}><FontAwesomeIcon icon={faEdit} /></button>
                      <button className="btn btn-danger btn-sm mx-2" onClick={() => handleDeleteBank(bank.id)}><FontAwesomeIcon icon={faTrashAlt} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBankDetailsForm;
