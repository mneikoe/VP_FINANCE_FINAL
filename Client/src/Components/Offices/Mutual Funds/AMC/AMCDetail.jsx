import React, { useEffect } from "react";
import { Table, Button } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";

import { deleteAMC, fetchAMC } from "../../../../redux/feature/AMC/AMCThunx";
function AMCDetail({ setActiveTab, setEditId }) {
  const dispatch = useDispatch();
  const AMCData = useSelector((state) => state.AMC);
  console.log(AMCData, "AMC Data");
  useEffect(() => {
    dispatch(fetchAMC());
  }, [dispatch]);

  // Delete

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this AMC?")) {
      dispatch(deleteAMC(id))
        .unwrap()
        .then(() => {
          toast.success("AMC deleted successfully!");
        })
        .catch((err) => {
          toast.error("Failed to delete AMC.");
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
            <th>AMC Name</th>
            <th>Login ID</th>
            <th>Password</th>
            <th>Expiry Date</th>

            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {AMCData.registrars?.map((item, index) => (
            <tr key={item._id || index}>
              <td>{index + 1}</td>
              <td>{item.registrar.registrarName}</td>
              <td>{item?.amcName}</td>
              <td>{item.loginName1}</td>
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
          {/* Showing 1 to {AMCData.length} of {AMCData.length} entries */}
          Showing 1 to {AMCData.registrars?.length || 0} of{" "}
          {AMCData.registrars?.length || 0} entries
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

export default AMCDetail;
