import React, { useEffect, useState } from "react";
import { Button, Form, Row, Col, Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  createImportantDocument,
  fetchImportantDocumentByID,
  updateImportantDocument,
} from "../../../../redux/feature/ImpDocument/DocumentThunx";
import { clearCurrent } from "../../../../redux/feature/ImpDocument/DocumentSlice";
// import {
//   createImportantDocument,
//   updateImportantDocument,
//   fetchImportantDocumentByID,
// } from "../../../redux/feature/ImportantDocument/DocumentThunx";
// import { clearCurrent } from "../../../redux/feature/ImportantDocument/DocumentSlice";

function AddImpDocument({ setActiveTab, editId, setEditId }) {
  const dispatch = useDispatch();
  const { current, loading } = useSelector((state) => state.importantDocuments);

  const [formData, setFormData] = useState({
    documentName: "",
    documentNumber: "",
    dateOfIssue: "",
    issuingAuthority: "",
    documentParticulars: "",
    importantDocPdfPath: null,
  });

  useEffect(() => {
    if (editId) dispatch(fetchImportantDocumentByID(editId));
  }, [dispatch, editId]);

  useEffect(() => {
    if (current && editId) {
      setFormData({
        documentName: current.documentName || "",
        documentNumber: current.documentNumber || "",
        dateOfIssue: current.dateOfIssue?.substring(0, 10) || "",
        issuingAuthority: current.issuingAuthority || "",
        documentParticulars: current.documentParticulars || "",
        importantDocPdfPath: null, // Don't prefill file
      });
    }
  }, [current, editId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) {
        payload.append(key, value);
      }
    });

    try {
      if (editId) {
        await dispatch(
          updateImportantDocument({ id: editId, formData: payload })
        ).unwrap();
      } else {
        await dispatch(createImportantDocument(payload)).unwrap();
      }

      dispatch(clearCurrent());
      setEditId(null);
      setActiveTab("view");
    } catch (err) {
      console.error("Failed to save document:", err);
    }

    setFormData({
      documentName: "",
      documentNumber: "",
      dateOfIssue: "",
      issuingAuthority: "",
      documentParticulars: "",
      importantDocPdfPath: null,
    });
  };

  return (
    <Card className="p-3 mt-3">
      <Form onSubmit={handleSubmit} encType="multipart/form-data">
        <Row>
          {[
            { label: "Name of Document", name: "documentName" },
            { label: "Document Number", name: "documentNumber" },
            { label: "Date of Issue", name: "dateOfIssue", type: "date" },
            { label: "Issuing Authority", name: "issuingAuthority" },
            { label: "Particulars", name: "documentParticulars" },
          ].map(({ label, name, type = "text" }) => (
            <Col md={4} key={name}>
              <Form.Group controlId={name}>
                <Form.Label>{label}</Form.Label>
                <Form.Control
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          ))}

          <Col md={4}>
            <Form.Group controlId="importantDocPdfPath">
              <Form.Label>Upload PDF</Form.Label>
              <Form.Control
                type="file"
                name="importantDocPdfPath"
                accept="application/pdf"
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Button
          className="mt-3"
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {editId ? "Update" : "Save"}
        </Button>
      </Form>
    </Card>
  );
}

export default AddImpDocument;
