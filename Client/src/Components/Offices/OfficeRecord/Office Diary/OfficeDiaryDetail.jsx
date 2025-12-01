import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Table } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";

import {
  deleteOfficeDiary,
  fetchOfficeDiaries,
} from "../../../../redux/feature/OfficeDiary/OfficeDiaryThunx";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
const OfficeDiaryDetail = ({ setActiveTab, setEditId }) => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.officeDiary);
  console.log(list, "office diary");
  useEffect(() => {
    dispatch(fetchOfficeDiaries());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!Array.isArray(list)) return <p>Invalid data format</p>;
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this Office Diary?")) {
      dispatch(deleteOfficeDiary(id))
        .unwrap()
        .then(() => {
          toast.success("Office Diary deleted successfully!");
        })
        .catch((err) => {
          toast.error("Failed to delete Office Diary.");
          console.log(err, "error in deleting");
        });
    }
  };
  const handleUpdate = (id) => {
    setEditId(id);
    setActiveTab("add");
  };

  return (
    <Card className="mt-3">
      <Card.Header>Office Diary List</Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Org. Name</th>
              <th>Service Person</th>
              <th>Contact No</th>
              <th>Licance No</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Purchage Date</th>
              <th>Amount</th>
              <th>User Id</th>
              <th>Password</th>
              <th>Particulars</th>
              <th>PDF</th>
              <th>Uploaded At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((diary, index) => (
              <tr key={diary._id}>
                <td>{index + 1}</td>
                <td>{diary.orgName}</td>
                <td>{diary.servicePerson}</td>
                <td>{diary.contactNo}</td>
                <td>{diary.licanceNo}</td>
                <td>{diary.startDate?.substring(0, 10)}</td>
                <td>{diary.endDate?.substring(0, 10)}</td>
                <td>{diary.purchageDate?.substring(0, 10)}</td>
                <td>{diary.amount}</td>
                <td>{diary.userId}</td>
                <td>{diary.password}</td>
                <td>{diary.particulars}</td>
                <td>
                  <a
                    href={diary.pdfPath}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View PDF
                  </a>
                </td>
                <td>{new Date(diary.uploadedAt).toLocaleString()}</td>
                <td>
                  <Button
                    variant="link"
                    onClick={() => handleUpdate(diary._id)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="link"
                    className="text-danger"
                    onClick={() => handleDelete(diary._id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
      <ToastContainer />
    </Card>
  );
};

export default OfficeDiaryDetail;
