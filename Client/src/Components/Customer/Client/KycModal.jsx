import React, { useState } from "react";
import { Button, Modal, Form, Table } from "react-bootstrap";

const KYCComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const [kycData, setKycData] = useState([]);

  const [form, setForm] = useState({
    member: "",
    description: "",
    refNo: "",
    file: null,
    shareWithCustomer: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      ...form,
      createdOn: new Date().toLocaleDateString("en-GB"),
    };
    setKycData([...kycData, newEntry]);
    setForm({
      member: "",
      description: "",
      refNo: "",
      file: null,
      shareWithCustomer: false,
    });
    setShowModal(false);
  };

  return (
    <div className="container mt-4">
      <Button variant="primary" onClick={() => setShowModal(true)}>
        + Add KYC
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add KYC Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Group Member</Form.Label>
              <Form.Select name="member" value={form.member} onChange={handleChange} required>
                <option value="">Select Member</option>
                <option>Vikas Pandey</option>
                <option>Namrata Pandey</option>
                <option>Anshuman Pandey</option>
                <option>Vandita Pandey</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mt-2">
              <Form.Label>Description</Form.Label>
              <Form.Control name="description" value={form.description} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mt-2">
              <Form.Label>Ref No.</Form.Label>
              <Form.Control name="refNo" value={form.refNo} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mt-2">
              <Form.Label>Select File</Form.Label>
              <Form.Control type="file" name="file" onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mt-2">
              <Form.Check
                type="checkbox"
                label="Can be shared with the customer"
                name="shareWithCustomer"
                checked={form.shareWithCustomer}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end mt-3">
              <Button type="submit" variant="success">OK</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Submitted KYC Table */}
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Member Name</th>
            <th>Description</th>
            <th>Reference No.</th>
            <th>Category</th>
            <th>Created On</th>
          </tr>
        </thead>
        <tbody>
          {kycData.map((item, idx) => (
            <tr key={idx}>
              <td>{item.member}</td>
              <td>{item.description}</td>
              <td>{item.refNo}</td>
              <td>Common</td>
              <td>{item.createdOn}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default KYCComponent;
