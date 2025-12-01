import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Table } from "react-bootstrap";
import { FaEdit, FaTrash, FaDownload } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import {
  deleteImportantDocument,
  fetchImportantDocuments,
} from "../../../../redux/feature/ImpDocument/DocumentThunx";
// import {
//   deleteImportantDocument,
//   fetchImportantDocuments,
// } from "../../../redux/feature/ImportantDocument/DocumentThunx";

const ImpDocumentDetail = ({ setActiveTab, setEditId }) => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector(
    (state) => state.importantDocuments
  );

  useEffect(() => {
    dispatch(fetchImportantDocuments());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      dispatch(deleteImportantDocument(id))
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
      <Card.Header className="text-center">Important Document List</Card.Header>
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
                <th>Name</th>
                <th>Number</th>
                <th>Date</th>
                <th>Authority</th>
                <th>Particulars</th>
                <th>PDF</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((doc, index) => (
                <tr key={doc._id}>
                  <td>{index + 1}</td>
                  <td>{doc.documentName}</td>
                  <td>{doc.documentNumber}</td>
                  <td>{doc.dateOfIssue?.substring(0, 10)}</td>
                  <td>{doc.issuingAuthority}</td>
                  <td>{doc.documentParticulars}</td>
                  <td>
                    {doc.importantDocPdfPath ? (
                      <a
                        href={doc.importantDocPdfPath}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaDownload />
                      </a>
                    ) : (
                      "No file"
                    )}
                  </td>
                  <td>
                    <Button
                      variant="link"
                      onClick={() => handleUpdate(doc._id)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="link"
                      className="text-danger"
                      onClick={() => handleDelete(doc._id)}
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

export default ImpDocumentDetail;
