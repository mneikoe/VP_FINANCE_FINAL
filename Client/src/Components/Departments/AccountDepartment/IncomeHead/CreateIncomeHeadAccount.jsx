import React, { useState } from "react";
import { Form, Row, Col, Button, Card } from "react-bootstrap";

const CreateIncomeHeadAccount = () => {
  const [formData, setFormData] = useState({
    accountName: "",
    financialProductCompany: "",
    incomeTaxRefund: "",
    incomeFromCommission: "",
    description: "",
    creditDate: "",
    amount: "",
  });

  const companies = [
    "LIC",
    "HDFC Life",
    "ICICI Prudential",
    "SBI Mutual Fund",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="d-flex justify-content-center">
      <Card
        className="shadow-lg border-0"
        style={{ width: "100%", maxWidth: "900px", borderRadius: "15px" }}
      >
        <Card.Body className="p-4">
          <h2 className="mb-4 text-center fw-bold text-primary">
            Create Account 
          </h2>

          <Form onSubmit={handleSubmit}>
            {/* Row 1 */}
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleChange}
                    placeholder="Enter Name"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Financial Product Company
                  </Form.Label>
                  <Form.Select
                    name="financialProductCompany"
                    value={formData.financialProductCompany}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Company</option>
                    {companies.map((company, index) => (
                      <option key={index} value={company}>
                        {company}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Row 2 */}
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Income Tax Refund
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="incomeTaxRefund"
                    value={formData.incomeTaxRefund}
                    onChange={handleChange}
                    placeholder="Enter refund amount"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Income From Commission
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="incomeFromCommission"
                    value={formData.incomeFromCommission}
                    onChange={handleChange}
                    placeholder="Enter commission amount"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Row 3 */}
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Credit Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="creditDate"
                    value={formData.creditDate}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Total Amount
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Enter total amount"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Description */}
            <Row className="mb-4">
              <Col>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Description
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter description"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="text-center">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="px-5 rounded-pill"
              >
                Save Account
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CreateIncomeHeadAccount;
