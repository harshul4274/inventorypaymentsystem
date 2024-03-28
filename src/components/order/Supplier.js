import React, { useState, useEffect } from "react";
import web3 from "../../utils/web3";
import InventoryPayment from "../../contracts/InventoryPayment.json";

import { toast, ToastContainer } from "react-toastify";

const AddBankDetailsForm = () => {
	const [supplierName, setSupplierName] = useState("");
	const [supplierNumber, setSupplierNumber] = useState("");
	const [supplierBankName, setSupplierBankName] = useState("");
	const [supplierAccountNumber, setSupplierAccountNumber] = useState("");
	const [supplierSortCode, setSupplierSortCode] = useState("");
	const [selectedSupplierId, setSelectedSupplierId] = useState("");

	const [supplierDetails, setSupplierDetails] = useState([]);
	const [inventoryContract, setInventoryContract] = useState(null);
	const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetchSupplierDetails();
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

  const fetchSupplierDetails = async () => {
    try {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = InventoryPayment.networks[networkId];
      const contract = new web3.eth.Contract(
        InventoryPayment.abi,
        deployedNetwork && deployedNetwork.address
      );
      const supplierDetailsObj = await contract.methods.getAllSuppliersDetails().call();
      resetForm();
      setSupplierDetails(supplierDetailsObj);
    } catch (error) {
      toast.error("Error fetching bank details:", error.message);
    } finally {
      resetForm();
    }
  };

  const handleAddSupplierDetails = async (e) => {
    e.preventDefault();
    try {
      if (selectedSupplierId == "") {
        const gasEstimate = await inventoryContract.methods
          .addSupplier(supplierName,supplierNumber, supplierBankName, supplierAccountNumber,supplierSortCode)
          .estimateGas({ from: accounts[0] });
        const gasLimit = gasEstimate * 2;
        await inventoryContract.methods
		.addSupplier(supplierName,supplierNumber, supplierBankName, supplierAccountNumber,supplierSortCode)
          .send({ from: accounts[0], gas: gasLimit });
      } else {
        const gasEstimate = await inventoryContract.methods
          .updateSupplier(selectedSupplierId, supplierName,supplierNumber, supplierBankName, supplierAccountNumber,supplierSortCode)
          .estimateGas({ from: accounts[0] });
        const gasLimit = gasEstimate * 2;
		await inventoryContract.methods
		.updateSupplier(selectedSupplierId, supplierName,supplierNumber, supplierBankName, supplierAccountNumber,supplierSortCode)
          .send({ from: accounts[0], gas: gasLimit });
      }
      fetchSupplierDetails();
    } catch (error) {
      toast.error(error.message);
    } finally {
      resetForm();
    }
  };

  const handleDeleteSupplier = async (supplierId) => {
    try {
      const gasEstimate = await inventoryContract.methods
        .deleteSupplier(supplierId)
        .estimateGas({ from: accounts[0] });
      const gasLimit = gasEstimate * 2;
      await inventoryContract.methods
        .deleteSupplier(supplierId)
        .send({ from: accounts[0], gas: gasLimit });
		fetchSupplierDetails();
    } catch (error) {
      toast.error(error.message);
    } finally {
      resetForm();
    }
  };

  const selectSupplierForEdit = (supplier) => {
	setSelectedSupplierId(supplier.supplierId);
	setSupplierName(supplier.supplierName);
	setSupplierNumber(supplier.supplierNumber);
	setSupplierBankName(supplier.supplierBank.bankName);
	setSupplierAccountNumber(supplier.supplierBank.accountNumber);
	setSupplierSortCode(supplier.supplierBank.sortCode);
  };

  const resetForm = () => {
    setSelectedSupplierId("");
	setSupplierName("");
	setSupplierNumber("");
	setSupplierBankName("");
	setSupplierAccountNumber("");
	setSupplierSortCode("");
  };

  const filteredSupplierDetails = supplierDetails.filter(supplier => supplier.supplierName !== null && supplier.supplierName !== "");
  return (
    <div className="table">
      <form onSubmit={handleAddSupplierDetails} className="mt-4">
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Supplier Name"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input
            type="tel"
            className="form-control"
            placeholder="Supplier Number"
            value={supplierNumber}
            onChange={(e) => setSupplierNumber(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Supplier Bank Name"
            value={supplierBankName}
            onChange={(e) => setSupplierBankName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input
            type="number"
            className="form-control"
            placeholder="Supplier Account Number"
            value={supplierAccountNumber}
            onChange={(e) => setSupplierAccountNumber(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Supplier Sort Code"
            value={supplierSortCode}
            onChange={(e) => setSupplierSortCode(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Supplier Id"
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Number</th>
            <th>Bank Name</th>
			<th>Bank Account Number</th>
			<th>Bank Sort Code</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSupplierDetails.map((supplier) => (
            <tr key={supplier.supplierId}>
              <td>{supplier.supplierName}</td>
              <td>{supplier.supplierNumber}</td>
              <td>{supplier.supplierBank.bankName}</td>			  
              <td>{supplier.supplierBank.accountNumber}</td>		  
              <td>{supplier.supplierBank.sortCode}</td>	
              <td>
                <button onClick={() => selectSupplierForEdit(supplier)}>Edit</button>
                <button onClick={() => handleDeleteSupplier(supplier.supplierId)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th>Name</th>
            <th>Number</th>
            <th>Bank Name</th>
			<th>Bank Account Number</th>
			<th>Bank Sort Code</th>
            <th>Actions</th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default AddBankDetailsForm;
