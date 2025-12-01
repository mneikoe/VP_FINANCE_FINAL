import React, { useEffect } from "react";
import { Table, Button } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";

import {
  deleteRegistrar,
  fetchRegistrars,
} from "../../../../redux/feature/Registrar/RegistrarThunx";
function RegistrarDetail({ setActiveTab, setEditId }) {
  const dispatch = useDispatch();
  const registrarData = useSelector((state) => state.registrar);
  console.log(registrarData, "registrar Data");
  useEffect(() => {
    dispatch(fetchRegistrars());
  }, [dispatch]);

  // Delete

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this registrar?")) {
      dispatch(deleteRegistrar(id))
        .unwrap()
        .then(() => {
          toast.success("Registrar deleted successfully!");
        })
        .catch((err) => {
          toast.error("Failed to delete registrar.");
          console.log(err, "error in deleting");
        });
    }
  };

  // Edit
  const handleUpdate = (id) => {
    setEditId(id);
    setActiveTab("add");
    // Add your update logic here, e.g., open modal or navigate to update form
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          Show
          <select className="mx-2">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          entries
        </div>
        <div>
          Search:
          <input type="text" className="mx-2" />
        </div>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>No.</th>
            <th>Registrar</th>
            {/* <th>Financial Product</th> */}
            <th>ARN No</th>
            <th>EUIN No</th>
            <th>Username</th>
            <th>Password</th>
            <th>Expiry Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {registrarData.registrars?.map((item, index) => (
            <tr key={item._id || index}>
              <td>{index + 1}</td>
              <td>{item.registrarName}</td>
              {/* <td>{item?.financialProduct?.name}</td> */}
              <td>{item.arn1}</td>
              <td>{item.euin1}</td>
              <td>{item.username1}</td>
              <td>{item.password1}</td>
              <td>{new Date(item.expiry1).toLocaleDateString()}</td>
              <td>
                <Button variant="link" onClick={() => handleUpdate(item._id)}>
                  <FaEdit />
                </Button>
                <Button
                  variant="link"
                  className="text-danger"
                  onClick={() => handleDelete(item._id)}
                >
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center">
        <div>
          {/* Showing 1 to {registrarData.length} of {registrarData.length} entries */}
          Showing 1 to {registrarData.registrars?.length || 0} of{" "}
          {registrarData.registrars?.length || 0} entries
        </div>
        <div>
          <Button variant="light" size="sm" disabled>
            Previous
          </Button>
          <Button variant="primary" size="sm" className="mx-1">
            1
          </Button>
          <Button variant="light" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default RegistrarDetail;
