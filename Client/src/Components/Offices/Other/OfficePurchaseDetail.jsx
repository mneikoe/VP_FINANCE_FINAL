import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Table } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import {
  deleteOfficePurchase,
  //   fetchOfficePurchaseByID,
  fetchOfficePurchases,
} from "../../../redux/feature/OfficePurchase/PurchaseThunx";
// import {
//   fetchOfficePurchases,
//   deleteOfficePurchase,
// } from "../../redux/features/officePurchase/officePurchaseThunks";

const OfficePurchaseDetail = ({ setActiveTab, setEditId }) => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.officePurchase);

  useEffect(() => {
    dispatch(fetchOfficePurchases());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (
      window.confirm("Are you sure you want to delete this Office Purchase?")
    ) {
      dispatch(deleteOfficePurchase(id))
        .unwrap()
        .then(() => toast.success("Deleted successfully"))
        .catch(() => toast.error("Failed to delete"));
    }
  };

  const handleUpdate = (id) => {
    setEditId(id);
    setActiveTab("add");
  };

  return (
    <Card className="mt-3">
      <Card.Header className="text-center">Office Purchase List</Card.Header>
      <Card.Body>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Vr No.</th>
                <th>Invoice No.</th>
                <th>Date</th>
                <th>Head of A/Cs</th>
                <th>Item Particulars</th>
                <th>Firm</th>
                <th>Rate</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((purchase, index) => (
                <tr key={purchase._id}>
                  <td>{index + 1}</td>
                  <td>{purchase.vrNo}</td>
                  <td>{purchase.invoiceNo}</td>
                  <td>{purchase.date?.substring(0, 10)}</td>
                  <td>{purchase.headOfACs}</td>
                  <td>{purchase.itemParticulars}</td>
                  <td>{purchase.firmName}</td>
                  <td>{purchase.ratePerUnit}</td>
                  <td>{purchase.quantity}</td>
                  <td>{purchase.amount}</td>
                  <td>
                    <Button
                      variant="link"
                      onClick={() => handleUpdate(purchase._id)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="link"
                      className="text-danger"
                      onClick={() => handleDelete(purchase._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
      <ToastContainer />
    </Card>
  );
};

export default OfficePurchaseDetail;
