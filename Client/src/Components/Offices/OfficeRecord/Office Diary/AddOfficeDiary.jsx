import React, { useEffect, useState } from "react";
import { Button, Form, Row, Col, Card } from "react-bootstrap";
import {
  createOfficeDiary,
  fetchOfficeDiaryByID,
  updateOfficeDiary,
} from "../../../../redux/feature/OfficeDiary/OfficeDiaryThunx";
import { useDispatch, useSelector } from "react-redux";

function AddOfficeDiary({ editId, setActiveTab, setEditId }) {
  const [orgName, setOrgName] = useState("");
  const [servicePerson, setServicePerson] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [licanceNo, setLicanceNo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [purchageDate, setPurchageDate] = useState("");
  const [amount, setAmount] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [particulars, setParticulars] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  const dispatch = useDispatch();
  const { current } = useSelector((state) => state.officeDiary);

  useEffect(() => {
    if (editId) {
      dispatch(fetchOfficeDiaryByID(editId));
    }
  }, [editId, dispatch]);

  useEffect(() => {
    if (current && editId) {
      setOrgName(current.orgName || "");
      setServicePerson(current.servicePerson || "");
      setContactNo(current.contactNo || "");
      setLicanceNo(current.licanceNo || "");
      setStartDate(current.startDate || "");
      setEndDate(current.endDate || "");
      setPurchageDate(current.purchageDate || "");
      setAmount(current.amount || "");
      setUserId(current.userId || "");
      setPassword(current.password || "");
      setParticulars(current.particulars || "");
    }
  }, [current, editId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orgName || !pdfFile) {
      alert("Please fill in the required fields");
      return;
    }

    const formData = new FormData();
    formData.append("orgName", orgName);
    formData.append("servicePerson", servicePerson);
    formData.append("contactNo", contactNo);
    formData.append("licanceNo", licanceNo);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("purchageDate", purchageDate);
    formData.append("amount", amount);
    formData.append("userId", userId);
    formData.append("password", password);
    formData.append("particulars", particulars);
    if (pdfFile) formData.append("diaryPdf", pdfFile);

    if (editId) {
      dispatch(updateOfficeDiary({ id: editId, formData }));
    } else {
      dispatch(createOfficeDiary(formData));
    }

    // Reset form
    setOrgName("");
    setServicePerson("");
    setContactNo("");
    setLicanceNo("");
    setStartDate("");
    setEndDate("");
    setPurchageDate("");
    setAmount("");
    setUserId("");
    setPassword("");
    setParticulars("");
    setPdfFile(null);
    setEditId(null);
    setActiveTab("view");
  };

  return (
    <Card className="p-3 mt-3">
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group controlId="formParticulars">
              <Form.Label>
                <strong>Particulars</strong>
              </Form.Label>
              <Form.Control
                type="text"
                value={particulars}
                onChange={(e) => setParticulars(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="orgName">
              <Form.Label>
                <strong>Org. Name</strong>
              </Form.Label>
              <Form.Control
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="servicePerson">
              <Form.Label>
                <strong>Service Person</strong>
              </Form.Label>
              <Form.Control
                type="text"
                value={servicePerson}
                onChange={(e) => setServicePerson(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="contactNo">
              <Form.Label>
                <strong>Contact No</strong>
              </Form.Label>
              <Form.Control
                type="text"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="licanceNo">
              <Form.Label>
                <strong>License No.</strong>
              </Form.Label>
              <Form.Control
                type="text"
                value={licanceNo}
                onChange={(e) => setLicanceNo(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="startDate">
              <Form.Label>
                <strong>Start Date</strong>
              </Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="endDate">
              <Form.Label>
                <strong>End Date</strong>
              </Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="purchageDate">
              <Form.Label>
                <strong>Purchage Date</strong>
              </Form.Label>
              <Form.Control
                type="date"
                value={purchageDate}
                onChange={(e) => setPurchageDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="amount">
              <Form.Label>
                <strong>Amount</strong>
              </Form.Label>
              <Form.Control
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="userId">
              <Form.Label>
                <strong>User Id</strong>
              </Form.Label>
              <Form.Control
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="password">
              <Form.Label>
                <strong>Password</strong>
              </Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formPdf">
              <Form.Label>
                <strong>Upload PDF Document</strong>
              </Form.Label>
              <Form.Control
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                required={!editId}
              />
            </Form.Group>
          </Col>
        </Row>
        <Button variant="primary" type="submit" className="mt-3">
          Save
        </Button>
      </Form>
    </Card>
  );
}

export default AddOfficeDiary;
