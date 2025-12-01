import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Modal, Button, Table } from "react-bootstrap";
import { saveAs } from "file-saver";
import { useReactToPrint } from "react-to-print";
import "bootstrap/dist/css/bootstrap.min.css";

function VacancyNotice() {
  const [vacancies, setVacancies] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedName, setSelectedName] = useState("");
  const printRef = useRef(null);

  useEffect(() => {
    axios
      .get("/api/vacancynotice/")
      .then((response) => {
        console.log("Vacancy Notice Data:", response.data);
        setVacancies(response.data);
      })
      .catch((error) => {
        console.error("Error fetching vacancy notices:", error);
      });
  }, []);

  const handleView = (docUrl) => {
    setSelectedDoc(docUrl);
    setSelectedName(docUrl.split("/").pop());
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedDoc(null);
  };

  const isPdf = (url) => url?.toLowerCase().endsWith(".pdf");

  const handleDownload = () => {
    if (!selectedDoc) return;
    saveAs(selectedDoc, selectedName);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedName || "Vacancy Document",
  });

  return (
    <div className="p-4">
      <h1 className="mb-4">Vacancy Notice</h1>

      {vacancies.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <Table bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th>Created At</th>
              <th>Designation</th>
              <th>Document</th>
            </tr>
          </thead>
          <tbody>
            {vacancies.map((item) => (
              <tr key={item._id}>
                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                <td>{item.designation}</td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleView(item.document)}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={show} onHide={handleClose} size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title>Document Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedDoc ? (
            <div ref={printRef}>
              {isPdf(selectedDoc) ? (
                <iframe
                  src={selectedDoc}
                  title="PDF Preview"
                  width="100%"
                  height="500px"
                  style={{
                    border: "none",
                    borderRadius: "8px",
                  }}
                ></iframe>
              ) : (
                <img
                  src={selectedDoc}
                  alt="Vacancy Document"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    objectFit: "contain",
                  }}
                />
              )}
            </div>
          ) : (
            <p>No document available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          {selectedDoc && (
            <>
              <Button variant="success" onClick={handleDownload}>
                Download
              </Button>
              <Button variant="info" onClick={handlePrint}>
                Print
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default VacancyNotice;