import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const AddBankDetailsForm = () => {
  const baseURL = process.env.REACT_APP_API_URL;
  const [bankDetails, setBankDetails] = useState([]);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [backupAmount, setBackupAmount] = useState('');
  const [selectedBankId, setSelectedBankId] = useState('');

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/bankDetails`);
      setBankDetails(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Error fetching bank details:', error.message);
    }
  };

  let filteredBankDetails = [];

  if (bankDetails.length > 0) {
    filteredBankDetails = bankDetails.filter(item => item[1] !== "");
  }

  const handleAddBankDetails = async (e) => {
    e.preventDefault();
    try {
      if(selectedBankId == ''){
        if(filteredBankDetails.length > 0 ){
          toast.error('Bank Details already exists, you can not add another.');
          return;
        }
      }
      if (!bankName.trim()) {
        toast.error('Bank Name cannot be empty');
        return;
      }
      if (!/^\d+$/.test(accountNumber) || accountNumber.length !== 10) {
        toast.error('Account Number must be numeric and 10 digits long');
        return;
      }
      if (isNaN(backupAmount)) {
        toast.error('Bank Amount must be numeric');
        return;
      }

      const requestBody = {
        bankName,
        accountNumber,
        backupAmount
      };
      if (selectedBankId === '') {
        await axios.post(`${baseURL}/api/addBankDetails`, requestBody);
        toast.success("Bank inserted successfully.");
      } else {
        await axios.put(`${baseURL}/api/updateBank/${selectedBankId}`, requestBody);
        toast.success("Bank updated successfully.");
      }
      fetchBankDetails();
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error('Error adding/updating bank details:', error.message);
      
      resetForm();
    }
  };

  const handleDeleteBank = async (bankId) => {
    try {
      const isConfirmed = window.confirm('Are you sure you want to delete this bank?');
      if (!isConfirmed) {
        return;
      }

      await axios.delete(`${baseURL}/api/deleteBank/${bankId}`); 
      fetchBankDetails();
      
      toast.success("Bank deleted successfully.");

    } catch (error) {
      console.error(error);
      toast.error('Error deleting bank:', error.message);
    } finally {
      resetForm();
    }
  };

  const selectBankForEdit = (bank) => {
    setSelectedBankId(bank[0]);
    setBankName(bank[1]);
    setAccountNumber(bank[2]);
    setBackupAmount(bank[3]);
  };

  const resetForm = () => {
    setBankName('');
    setAccountNumber('');
    setBackupAmount('');
    setSelectedBankId('');
  };

  return (
    <div className="custom">
      <div className='row justify-content-center'>
        <div className='col-5'>
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
                  <th colSpan={4}>
                    <h2>Bank Details</h2>
                    </th>
                </tr>
                <tr>
                  <th>Name</th>
                  <th>Account Number</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBankDetails.map(bank => (
                  <tr key={bank[0]}>
                    <td>{bank[0]} {bank[1]}</td>
                    <td>{bank[2]}</td>
                    <td>{bank[3]}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => selectBankForEdit(bank)}><FontAwesomeIcon icon={faEdit} /></button>
                      <button className="btn btn-danger btn-sm mx-2" onClick={() => handleDeleteBank(bank[0])}><FontAwesomeIcon icon={faTrashAlt} /></button>
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
