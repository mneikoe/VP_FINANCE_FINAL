import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Table } from "react-bootstrap";
import {
  createKyc,
  fetchKycsByClient,
  deleteKyc,
} from "../../../redux/feature/ClientRedux/KycThunx";

const KycForm = ({ clientId, familyMembers = [] }) => {
  const dispatch = useDispatch();
  const { kycData, loading } = useSelector((state) => state.Kyc);

  const [form, setForm] = useState({
    memberName: "",
    documentName: "",
    documentNumber: "",
    remark: "",
    document: null,
  });

  useEffect(() => {
    if (clientId) {
      dispatch(fetchKycsByClient(clientId));
    }
  }, [dispatch, clientId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("memberName", form.memberName);
    fd.append("documentName", form.documentName);
    fd.append("documentNumber", form.documentNumber);
    fd.append("remark", form.remark);
    fd.append("document", form.document);

    dispatch(createKyc({ clientId, formData: fd }))
      .unwrap()
      .then(() => {
        dispatch(fetchKycsByClient(clientId));
        setForm({
          memberName: "",
          documentName: "",
          documentNumber: "",
          remark: "",
          document: null,
        });
      });
  };

  return (
    <div>
      <h4>KYC Details</h4>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-2">
          <Form.Label>Member</Form.Label>
          <Form.Select
            name="memberName"
            value={form.memberName}
            onChange={handleChange}
            required
          >
            <option value="">Select Member</option>
            {familyMembers.map((m, i) => (
              <option key={i} value={m.name}>
                {m.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Document Name</Form.Label>
          <Form.Control
            name="documentName"
            value={form.documentName}
            onChange={handleChange}
            placeholder="Aadhaar / PAN"
            required
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Document Number</Form.Label>
          <Form.Control
            name="documentNumber"
            value={form.documentNumber}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Remark</Form.Label>
          <Form.Control
            name="remark"
            value={form.remark}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Upload Document</Form.Label>
          <Form.Control
            type="file"
            name="document"
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button type="submit" disabled={loading}>
          Save KYC
        </Button>
      </Form>

      <hr />

      <Table bordered hover>
        <thead>
          <tr>
            <th>Member</th>
            <th>Document</th>
            <th>Number</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {kycData?.map((k) => (
            <tr key={k._id}>
              <td>{k.memberName}</td>
              <td>{k.documentName}</td>
              <td>{k.documentNumber}</td>
              <td>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() =>
                    dispatch(deleteKyc(k._id)).then(() =>
                      dispatch(fetchKycsByClient(clientId))
                    )
                  }
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default KycForm;
