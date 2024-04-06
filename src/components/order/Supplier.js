import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import { toast } from "react-toastify";

const AddBankDetailsForm = () => {
  const baseURL = process.env.REACT_APP_API_URL;
  const [supplierName, setSupplierName] = useState("");
  const [supplierNumber, setSupplierNumber] = useState("");
  const [supplierBankName, setSupplierBankName] = useState("");
  const [supplierAccountNumber, setSupplierAccountNumber] = useState("");
  const [supplierSortCode, setSupplierSortCode] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");

  const [supplierDetails, setSupplierDetails] = useState([]);

  useEffect(() => {
    fetchSupplierDetails();
  }, []);

  const fetchSupplierDetails = async () => {
    try {
      const supplierDetailsObj = await axios.get(
        `${baseURL}/api/getSupplierDetails`
      );
      setSupplierDetails(supplierDetailsObj.data.data);
    } catch (error) {
      toast.error("Error fetching supplier details:", error.message);
    } finally {
      resetForm();
    }
  };

  const validateForm = () => {
    if (!supplierName.trim()) {
      toast.error("Supplier Name cannot be empty");
      return false;
    }
    if (!/^\d+$/.test(supplierNumber) || supplierNumber.length !== 10) {
      toast.error("Supplier Mobile Number must be numeric and 10 digits long");
      return false;
    }
    if (!supplierBankName.trim()) {
      toast.error("Supplier Bank Name cannot be empty");
      return false;
    }
    if (!/^\d+$/.test(supplierAccountNumber)) {
      toast.error("Supplier Account Number must be numeric");
      return false;
    }
    if (!supplierSortCode.trim() || supplierSortCode.length !== 6) {
      toast.error("Supplier IFSC Code cannot be empty and 6 length");
      return false;
    }
    return true;
  };
  const handleAddSupplierDetails = async (e) => {
    e.preventDefault();
    try {
      if (!validateForm()) {
        return;
      }
      const requestBody = {
        supplierName,
        supplierNumber,
        supplierBankName,
        supplierAccountNumber,
        supplierSortCode,
      };
      if (selectedSupplierId == "") {
        await axios.post(`${baseURL}/api/addSupplier`, requestBody);
        toast.success("Supplier inserted successfully.");
      } else {
        const requestBody = {
          supplierName,
          supplierNumber,
          supplierBankName,
          supplierAccountNumber,
          supplierSortCode,
        };
        await axios.put(
          `${baseURL}/api/updateSupplier/${selectedSupplierId}`,
          requestBody
        );
        toast.success("Supplier updated successfully.");
      }
      fetchSupplierDetails();

      resetForm();
    } catch (error) {
      toast.error(error.message);
      resetForm();
    }
  };

  const handleDeleteSupplier = async (supplierId) => {
    try {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this supplier?"
      );
      if (!isConfirmed) {
        return;
      }
      await axios.delete(`${baseURL}/api/deleteSupplier/${supplierId}`);
      toast.success("Supplier deleted successfully.");
      fetchSupplierDetails();
    } catch (error) {
      toast.error(error.message);
    } finally {
      resetForm();
    }
  };

  const selectSupplierForEdit = (supplier) => {
    setSelectedSupplierId(supplier[0]);
    setSupplierName(supplier[1]);
    setSupplierNumber(supplier[2]);
    setSupplierBankName(supplier[3][0]);
    setSupplierAccountNumber(supplier[3][1]);
    setSupplierSortCode(supplier[3][2]);
  };

  const resetForm = () => {
    setSelectedSupplierId("");
    setSupplierName("");
    setSupplierNumber("");
    setSupplierBankName("");
    setSupplierAccountNumber("");
    setSupplierSortCode("");
  };

  let filteredSupplierDetails = [];

  if (supplierDetails.length > 0) {
    filteredSupplierDetails = supplierDetails.filter(
      (supplier) => supplier[1] !== ""
    );
  }

  return (
    <div className="custom">
      <div className="row justify-content-center">
        <div className="col-6">
          <div className="custom-form p-4 row">
            <h2 className="mb-4">Supplier Form</h2>
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
                  placeholder="Supplier Mobile Number"
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
                  placeholder="Supplier IFSC Code"
                  value={supplierSortCode}
                  onChange={(e) => setSupplierSortCode(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <input
                  type="hidden"
                  className="form-control"
                  placeholder="Supplier Id"
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
              <button
                type="reset"
                className="btn btn-danger mx-2"
                onClick={resetForm}
              >
                Reset
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12 table-container">
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead className="thead-dark">
                <tr>
                  <th>Supplier Name</th>
                  <th>Mobile Number</th>
                  <th>Bank Name</th>
                  <th>Bank Account Number</th>
                  <th>Bank IFSC Code</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSupplierDetails.map((supplier) => (
                  <tr key={supplier[0]}>
                    <td>
                      {supplier[0]} {supplier[1]}
                    </td>
                    <td>{supplier[2]}</td>
                    <td>{supplier[3][0]}</td>
                    <td>{supplier[3][1]}</td>
                    <td>{supplier[3][2]}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => selectSupplierForEdit(supplier)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      {/* <button className="btn btn-danger btn-sm mx-2" onClick={() => handleDeleteSupplier(supplier[0])}><FontAwesomeIcon icon={faTrashAlt} /></button> */}
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
