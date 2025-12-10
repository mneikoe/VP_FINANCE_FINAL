import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Tab,
  Nav,
  Modal,
} from "react-bootstrap";
import {
  FiUser,
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiFileText,
  FiEdit,
  FiSave,
  FiX,
  FiArrowLeft,
  FiPhone,
  FiMail,
  FiMapPin,
  FiBriefcase,
  FiHome,
} from "react-icons/fi";
import "./SuspectDetailsPage.css";

const SuspectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [suspect, setSuspect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [activeTab, setActiveTab] = useState("personal");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [callHistory, setCallHistory] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);

  useEffect(() => {
    fetchSuspectDetails();
  }, [id]);

  const fetchSuspectDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/suspect/${id}`);

      if (response.data && response.data.success) {
        const suspectData = response.data.suspect;
        setSuspect(suspectData);
        setEditedData(suspectData.personalDetails || {});

        // Call history
        if (suspectData.callTasks && Array.isArray(suspectData.callTasks)) {
          setCallHistory(suspectData.callTasks);
        }

        // Family members
        if (
          suspectData.familyMembers &&
          Array.isArray(suspectData.familyMembers)
        ) {
          setFamilyMembers(suspectData.familyMembers);
        }
      } else {
        setError("Failed to fetch suspect details");
      }
    } catch (error) {
      console.error("Error fetching suspect details:", error);
      setError(
        error.response?.data?.message || "Network error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditing(true);
    setEditedData(suspect?.personalDetails || {});
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditedData(suspect?.personalDetails || {});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setUpdateLoading(true);
      setUpdateSuccess(false);

      const response = await axios.put(
        `/api/suspect/update/personaldetails/${id}`,
        { personalDetails: editedData }
      );

      if (response.data && response.data.success) {
        setUpdateSuccess(true);
        setSuspect((prev) => ({
          ...prev,
          personalDetails: editedData,
        }));
        setEditing(false);

        // Auto hide success message after 3 seconds
        setTimeout(() => {
          setUpdateSuccess(false);
        }, 3000);
      } else {
        throw new Error(response.data?.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating suspect details:", error);
      alert(`Update failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdateStatus = () => {
    setShowUpdateModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Appointment Scheduled":
        return "badge-success";
      case "Callback":
        return "badge-warning";
      case "Not Interested":
      case "Not Reachable":
      case "Wrong Number":
        return "badge-danger";
      case "Call Not Picked":
      case "Busy on Another Call":
      case "Call After Sometimes":
      case "Others":
        return "badge-info";
      case "Not Contacted":
        return "badge-secondary";
      default:
        return "badge-secondary";
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading suspect details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Error</h4>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Go Back
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!suspect) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <h4>No Data Found</h4>
          <p>Suspect not found or no data available.</p>
          <Button variant="outline-warning" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Go Back
          </Button>
        </Alert>
      </Container>
    );
  }

  const personal = suspect.personalDetails || {};

  return (
    <Container fluid className="suspect-details-page py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Button
                variant="outline-primary"
                onClick={() => navigate(-1)}
                className="mb-3"
              >
                <FiArrowLeft /> Back to Dashboard
              </Button>
              <h2 className="mb-0">
                <FiUser className="me-2" />
                {personal.name || "Unknown"} - Details
              </h2>
              <p className="text-muted mb-0">
                Group Code: <strong>{personal.groupCode || "-"}</strong> |
                Status:{" "}
                <span
                  className={`badge ${getStatusBadgeColor(
                    "Not Contacted"
                  )} ms-2`}
                >
                  {suspect.status || "suspect"}
                </span>
              </p>
            </div>
            <div>
              {!editing ? (
                <Button variant="outline-primary" onClick={handleEditClick}>
                  <FiEdit /> Edit Details
                </Button>
              ) : (
                <div>
                  <Button
                    variant="success"
                    onClick={handleSaveChanges}
                    disabled={updateLoading}
                  >
                    {updateLoading ? <Spinner size="sm" /> : <FiSave />}
                    {updateLoading ? " Saving..." : " Save Changes"}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={handleCancelEdit}
                    className="ms-2"
                  >
                    <FiX /> Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {updateSuccess && (
            <Alert variant="success" className="mt-3">
              ✅ Details updated successfully!
            </Alert>
          )}
        </Col>
      </Row>

      {/* Tabs Navigation */}
      <Row className="mb-4">
        <Col>
          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Nav variant="tabs" className="custom-tabs">
              <Nav.Item>
                <Nav.Link eventKey="personal">
                  <FiUser className="me-2" />
                  Personal Details
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="family">
                  <FiUsers className="me-2" />
                  Family Members ({familyMembers.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="financial">
                  <FiDollarSign className="me-2" />
                  Financial Info
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="calls">
                  <FiPhone className="me-2" />
                  Call History ({callHistory.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="additional">
                  <FiFileText className="me-2" />
                  Additional Info
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Tab.Container>
        </Col>
      </Row>

      {/* Tab Content */}
      <Tab.Container activeKey={activeTab}>
        <Tab.Content>
          {/* Personal Details Tab */}
          <Tab.Pane eventKey="personal">
            <Card>
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <FiUser className="me-2" />
                  Personal Information
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Name</strong>
                      </Form.Label>
                      {editing ? (
                        <Form.Control
                          type="text"
                          name="name"
                          value={editedData.name || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="form-control-static">
                          {personal.name || "-"}
                        </p>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Group Name</strong>
                      </Form.Label>
                      {editing ? (
                        <Form.Control
                          type="text"
                          name="groupName"
                          value={editedData.groupName || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="form-control-static">
                          {personal.groupName || "-"}
                        </p>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FiPhone className="me-2" />
                        <strong>Mobile No</strong>
                      </Form.Label>
                      {editing ? (
                        <Form.Control
                          type="text"
                          name="mobileNo"
                          value={editedData.mobileNo || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="d-flex align-items-center">
                          <p className="form-control-static mb-0">
                            {personal.mobileNo || "-"}
                          </p>
                          {personal.mobileNo && (
                            <a
                              href={`tel:${personal.mobileNo}`}
                              className="ms-2 btn btn-sm btn-outline-primary"
                            >
                              📞 Call
                            </a>
                          )}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Contact No</strong>
                      </Form.Label>
                      {editing ? (
                        <Form.Control
                          type="text"
                          name="contactNo"
                          value={editedData.contactNo || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="d-flex align-items-center">
                          <p className="form-control-static mb-0">
                            {personal.contactNo || "-"}
                          </p>
                          {personal.contactNo && (
                            <a
                              href={`tel:${personal.contactNo}`}
                              className="ms-2 btn btn-sm btn-outline-primary"
                            >
                              📞 Call
                            </a>
                          )}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FiMail className="me-2" />
                        <strong>Email</strong>
                      </Form.Label>
                      {editing ? (
                        <Form.Control
                          type="email"
                          name="emailId"
                          value={editedData.emailId || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="form-control-static">
                          {personal.emailId || "-"}
                        </p>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FiMapPin className="me-2" />
                        <strong>City</strong>
                      </Form.Label>
                      {editing ? (
                        <Form.Control
                          type="text"
                          name="city"
                          value={editedData.city || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="form-control-static">
                          {personal.city || "-"}
                        </p>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Area</strong>
                      </Form.Label>
                      {editing ? (
                        <Form.Control
                          type="text"
                          name="preferredMeetingArea"
                          value={editedData.preferredMeetingArea || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="form-control-static">
                          {personal.preferredMeetingArea || "-"}
                        </p>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FiBriefcase className="me-2" />
                        <strong>Occupation</strong>
                      </Form.Label>
                      {editing ? (
                        <Form.Control
                          type="text"
                          name="occupation"
                          value={editedData.occupation || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="form-control-static">
                          {personal.occupation || "-"}
                        </p>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Lead Source</strong>
                      </Form.Label>
                      {editing ? (
                        <Form.Control
                          type="text"
                          name="leadSource"
                          value={editedData.leadSource || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="form-control-static">
                          {personal.leadSource || "-"}
                        </p>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Lead Occupation</strong>
                      </Form.Label>
                      {editing ? (
                        <Form.Control
                          type="text"
                          name="leadOccupation"
                          value={editedData.leadOccupation || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="form-control-static">
                          {personal.leadOccupation || "-"}
                        </p>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Grade</strong>
                      </Form.Label>
                      {editing ? (
                        <Form.Control
                          type="text"
                          name="grade"
                          value={editedData.grade || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="form-control-static">
                          {personal.grade || "-"}
                        </p>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Annual Income</strong>
                      </Form.Label>
                      {editing ? (
                        <Form.Control
                          type="text"
                          name="annualIncome"
                          value={editedData.annualIncome || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="form-control-static">
                          {personal.annualIncome || "-"}
                        </p>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FiCalendar className="me-2" />
                        <strong>Date of Birth</strong>
                      </Form.Label>
                      {editing ? (
                        <Form.Control
                          type="date"
                          name="dob"
                          value={
                            editedData.dob
                              ? new Date(personal.dob)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="form-control-static">
                          {formatDate(personal.dob)}
                        </p>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Assigned To</strong>
                      </Form.Label>
                      <p className="form-control-static">
                        {suspect.assignedTo?.username || "Not Assigned"}
                      </p>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Assigned Date</strong>
                      </Form.Label>
                      <p className="form-control-static">
                        {formatDate(suspect.assignedAt)}
                      </p>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Residential Address</strong>
                      </Form.Label>
                      {editing ? (
                        <Form.Control
                          as="textarea"
                          rows={2}
                          name="resiAddr"
                          value={editedData.resiAddr || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="form-control-static">
                          {personal.resiAddr || "-"}
                        </p>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Remarks</strong>
                      </Form.Label>
                      {editing ? (
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="remark"
                          value={editedData.remark || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="form-control-static">
                          {personal.remark || "-"}
                        </p>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Family Members Tab */}
          <Tab.Pane eventKey="family">
            <Card>
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">
                  <FiUsers className="me-2" />
                  Family Members
                </h5>
              </Card.Header>
              <Card.Body>
                {familyMembers.length === 0 ? (
                  <Alert variant="info">No family members added yet.</Alert>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Relation</th>
                          <th>Occupation</th>
                          <th>Annual Income</th>
                          <th>Date of Birth</th>
                          <th>Contact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {familyMembers.map((member, index) => (
                          <tr key={index}>
                            <td>{member.name || "-"}</td>
                            <td>{member.relation || "-"}</td>
                            <td>{member.occupation || "-"}</td>
                            <td>{member.annualIncome || "-"}</td>
                            <td>{formatDate(member.dobActual)}</td>
                            <td>{member.contact || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Financial Info Tab */}
          <Tab.Pane eventKey="financial">
            <Card>
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">
                  <FiDollarSign className="me-2" />
                  Financial Information
                </h5>
              </Card.Header>
              <Card.Body>
                {!suspect.financialInfo ? (
                  <Alert variant="info">
                    No financial information available.
                  </Alert>
                ) : (
                  <>
                    {/* Insurance */}
                    <h6 className="text-success mb-3">Insurance</h6>
                    {suspect.financialInfo.insurance?.length > 0 ? (
                      <div className="table-responsive mb-4">
                        <table className="table table-sm table-bordered">
                          <thead>
                            <tr>
                              <th>Policy No</th>
                              <th>Company</th>
                              <th>Plan Name</th>
                              <th>Sum Assured</th>
                              <th>Premium</th>
                              <th>Start Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {suspect.financialInfo.insurance.map((ins, idx) => (
                              <tr key={idx}>
                                <td>{ins.policyNumber || "-"}</td>
                                <td>{ins.insuranceCompany || "-"}</td>
                                <td>{ins.planName || "-"}</td>
                                <td>{ins.sumAssured || "-"}</td>
                                <td>{ins.premium || "-"}</td>
                                <td>{formatDate(ins.startDate)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <Alert variant="secondary" className="mb-4">
                        No insurance details available.
                      </Alert>
                    )}

                    {/* Investments */}
                    <h6 className="text-success mb-3">Investments</h6>
                    {suspect.financialInfo.investments?.length > 0 ? (
                      <div className="table-responsive mb-4">
                        <table className="table table-sm table-bordered">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Company</th>
                              <th>Plan Name</th>
                              <th>Amount</th>
                              <th>Start Date</th>
                              <th>Maturity Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {suspect.financialInfo.investments.map(
                              (inv, idx) => (
                                <tr key={idx}>
                                  <td>{inv.financialProduct || "-"}</td>
                                  <td>{inv.companyName || "-"}</td>
                                  <td>{inv.planName || "-"}</td>
                                  <td>{inv.amount || "-"}</td>
                                  <td>{formatDate(inv.startDate)}</td>
                                  <td>{formatDate(inv.maturityDate)}</td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <Alert variant="secondary" className="mb-4">
                        No investment details available.
                      </Alert>
                    )}

                    {/* Loans */}
                    <h6 className="text-success mb-3">Loans</h6>
                    {suspect.financialInfo.loans?.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered">
                          <thead>
                            <tr>
                              <th>Loan Type</th>
                              <th>Company</th>
                              <th>Account No</th>
                              <th>Outstanding Amount</th>
                              <th>Interest Rate</th>
                              <th>Start Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {suspect.financialInfo.loans.map((loan, idx) => (
                              <tr key={idx}>
                                <td>{loan.loanType || "-"}</td>
                                <td>{loan.companyName || "-"}</td>
                                <td>{loan.loanAccountNumber || "-"}</td>
                                <td>{loan.outstandingAmount || "-"}</td>
                                <td>{loan.interestRate || "-"}%</td>
                                <td>{formatDate(loan.startDate)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <Alert variant="secondary">
                        No loan details available.
                      </Alert>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Call History Tab */}
          <Tab.Pane eventKey="calls">
            <Card>
              <Card.Header className="bg-warning text-dark">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <FiPhone className="me-2" />
                    Call History ({callHistory.length})
                  </h5>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleUpdateStatus}
                  >
                    Update Status
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {callHistory.length === 0 ? (
                  <Alert variant="info">
                    No call history available. This suspect has not been
                    contacted yet.
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Status</th>
                          <th>Remarks</th>
                          <th>Next Follow-up</th>
                          <th>Next Appointment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {callHistory
                          .sort(
                            (a, b) =>
                              new Date(b.taskDate) - new Date(a.taskDate)
                          )
                          .map((call, index) => (
                            <tr key={index}>
                              <td>{formatDate(call.taskDate)}</td>
                              <td>{call.taskTime || "-"}</td>
                              <td>
                                <span
                                  className={`badge ${getStatusBadgeColor(
                                    call.taskStatus
                                  )}`}
                                >
                                  {call.taskStatus}
                                </span>
                              </td>
                              <td>{call.taskRemarks || "-"}</td>
                              <td>
                                {call.nextFollowUpDate
                                  ? `${formatDate(call.nextFollowUpDate)} ${
                                      call.nextFollowUpTime || ""
                                    }`
                                  : "-"}
                              </td>
                              <td>
                                {call.nextAppointmentDate
                                  ? `${formatDate(call.nextAppointmentDate)} ${
                                      call.nextAppointmentTime || ""
                                    }`
                                  : "-"}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Additional Info Tab */}
          <Tab.Pane eventKey="additional">
            <Row>
              {/* Future Priorities */}
              <Col md={6}>
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Future Priorities</h5>
                  </Card.Header>
                  <Card.Body>
                    {suspect.futurePriorities?.length > 0 ? (
                      <ul className="list-group">
                        {suspect.futurePriorities.map((priority, idx) => (
                          <li key={idx} className="list-group-item">
                            <strong>{priority.priorityName}</strong>
                            <br />
                            Members: {priority.members?.join(", ") || "-"}
                            <br />
                            Amount: ₹{priority.approxAmount || "0"}
                            <br />
                            Duration: {priority.duration || "-"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Alert variant="info">No future priorities set.</Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Proposed Plans */}
              <Col md={6}>
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Proposed Plans</h5>
                  </Card.Header>
                  <Card.Body>
                    {suspect.proposedPlan?.length > 0 ? (
                      <ul className="list-group">
                        {suspect.proposedPlan.map((plan, idx) => (
                          <li key={idx} className="list-group-item">
                            <strong>{plan.financialProduct}</strong>
                            <br />
                            Company: {plan.financialCompany || "-"}
                            <br />
                            Plan: {plan.planName || "-"}
                            <br />
                            Status:{" "}
                            <span className="badge bg-info">
                              {plan.status || "Pending"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Alert variant="info">No proposed plans available.</Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Needs */}
            <Row>
              <Col md={12}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Needs & Requirements</h5>
                  </Card.Header>
                  <Card.Body>
                    {suspect.needs ? (
                      <Row>
                        <Col md={6}>
                          <p>
                            <strong>Financial Products:</strong>{" "}
                            {suspect.needs.financialProducts || "-"}
                          </p>
                          <p>
                            <strong>Any Correction:</strong>{" "}
                            {suspect.needs.anyCorrection || "-"}
                          </p>
                          <p>
                            <strong>Any Updation:</strong>{" "}
                            {suspect.needs.anyUpdation || "-"}
                          </p>
                        </Col>
                        <Col md={6}>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={suspect.needs.financialCalculation}
                              disabled
                            />
                            <label className="form-check-label">
                              Financial Calculation Required
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={suspect.needs.assesmentOfNeed}
                              disabled
                            />
                            <label className="form-check-label">
                              Assessment of Need Required
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={suspect.needs.portfolioManagement}
                              disabled
                            />
                            <label className="form-check-label">
                              Portfolio Management Required
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={suspect.needs.doorStepServices}
                              disabled
                            />
                            <label className="form-check-label">
                              Door Step Services Required
                            </label>
                          </div>
                        </Col>
                      </Row>
                    ) : (
                      <Alert variant="info">
                        No needs information available.
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Update Status Modal */}
      <Modal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Status for {personal.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            This feature will allow you to update the status directly from here.
            For now, please go back to the dashboard and use the "Update Status"
            button there.
          </Alert>
          <div className="text-center">
            <Button variant="primary" onClick={() => navigate(-1)}>
              Go to Dashboard
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SuspectDetailsPage;
