import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Tab,
  Nav,
  Tabs,
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
  FiCheckCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";

// Import AddSuspect component
import AddSuspect from "./AddSuspect"; // Adjust path as needed

const SuspectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [suspect, setSuspect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [editing, setEditing] = useState(false);
  const [callHistory, setCallHistory] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [financialInfo, setFinancialInfo] = useState(null);
  const [needs, setNeeds] = useState(null);
  const [futurePriorities, setFuturePriorities] = useState([]);
  const [proposedPlan, setProposedPlan] = useState([]);

  // Fetch all suspect details
  const fetchSuspectDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/suspect/${id}`);

      if (response.data && response.data.success) {
        const suspectData = response.data.suspect;
        setSuspect(suspectData);

        // Set all data from suspect
        setFamilyMembers(suspectData.familyMembers || []);
        setFinancialInfo(suspectData.financialInfo || null);
        setNeeds(suspectData.needs || null);
        setFuturePriorities(suspectData.futurePriorities || []);
        setProposedPlan(suspectData.proposedPlan || []);

        // Fetch call history
        if (suspectData.callTasks && Array.isArray(suspectData.callTasks)) {
          setCallHistory(suspectData.callTasks);
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

  useEffect(() => {
    fetchSuspectDetails();
  }, [id]);

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

  // Handle successful update from AddSuspect component
  const handleSuspectUpdated = (updatedSuspectId) => {
    toast.success("Suspect details updated successfully!");
    setEditing(false);
    // Refresh data
    fetchSuspectDetails();
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
                    suspect.status
                  )} ms-2`}
                >
                  {suspect.status || "suspect"}
                </span>
              </p>
            </div>
            <div>
              {!editing ? (
                <Button
                  variant="outline-primary"
                  onClick={() => setEditing(true)}
                >
                  <FiEdit /> Edit Personal Details
                </Button>
              ) : (
                <Button
                  variant="outline-secondary"
                  onClick={() => setEditing(false)}
                >
                  <FiX /> Cancel Edit
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Main Content - Show AddSuspect form when editing, else show tabs */}
      {editing ? (
        <Card className="mb-4">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">
              <FiEdit className="me-2" />
              Edit Personal Details
            </h5>
          </Card.Header>
          <Card.Body>
            <AddSuspect
              isEdit={true}
              suspectData={suspect}
              onSuspectCreated={handleSuspectUpdated}
            />
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Quick Info Card */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="h-100">
                <Card.Body className="text-center">
                  <FiUser className="text-primary mb-2" size={30} />
                  <h5>Basic Info</h5>
                  <p className="mb-1">
                    <strong>Name:</strong> {personal.name || "-"}
                  </p>
                  <p className="mb-1">
                    <strong>Group:</strong> {personal.groupName || "-"}
                  </p>
                  <p className="mb-1">
                    <strong>Gender:</strong> {personal.gender || "-"}
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100">
                <Card.Body className="text-center">
                  <FiPhone className="text-success mb-2" size={30} />
                  <h5>Contact</h5>
                  <p className="mb-1">
                    <strong>Mobile:</strong> {personal.mobileNo || "-"}
                  </p>
                  <p className="mb-1">
                    <strong>Email:</strong> {personal.emailId || "-"}
                  </p>
                  <p className="mb-1">
                    <strong>City:</strong> {personal.city || "-"}
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100">
                <Card.Body className="text-center">
                  <FiBriefcase className="text-warning mb-2" size={30} />
                  <h5>Professional</h5>
                  <p className="mb-1">
                    <strong>Org:</strong> {personal.organisation || "-"}
                  </p>
                  <p className="mb-1">
                    <strong>Designation:</strong> {personal.designation || "-"}
                  </p>
                  <p className="mb-1">
                    <strong>Income:</strong> {personal.annualIncome || "-"}
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100">
                <Card.Body className="text-center">
                  <FiCheckCircle className="text-info mb-2" size={30} />
                  <h5>Status</h5>
                  <p className="mb-1">
                    <strong>Assigned To:</strong>{" "}
                    {suspect.assignedTo?.username || "Not Assigned"}
                  </p>
                  <p className="mb-1">
                    <strong>Assigned Date:</strong>{" "}
                    {formatDate(suspect.assignedAt)}
                  </p>
                  <p className="mb-1">
                    <strong>Call Tasks:</strong> {callHistory.length}
                  </p>
                </Card.Body>
              </Card>
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
              {/* Personal Details Tab (Read-only) */}
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
                        <div className="mb-3">
                          <label className="form-label">
                            <strong>Name</strong>
                          </label>
                          <div className="form-control-static border rounded p-2 bg-light">
                            {personal.name || "-"}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="form-label">
                            <strong>Group Name</strong>
                          </label>
                          <div className="form-control-static border rounded p-2 bg-light">
                            {personal.groupName || "-"}
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={4}>
                        <div className="mb-3">
                          <label className="form-label">
                            <strong>Mobile No</strong>
                          </label>
                          <div className="form-control-static border rounded p-2 bg-light">
                            {personal.mobileNo || "-"}
                          </div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="mb-3">
                          <label className="form-label">
                            <strong>WhatsApp No</strong>
                          </label>
                          <div className="form-control-static border rounded p-2 bg-light">
                            {personal.whatsappNo || "-"}
                          </div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="mb-3">
                          <label className="form-label">
                            <strong>Email</strong>
                          </label>
                          <div className="form-control-static border rounded p-2 bg-light">
                            {personal.emailId || "-"}
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="form-label">
                            <strong>Date of Birth</strong>
                          </label>
                          <div className="form-control-static border rounded p-2 bg-light">
                            {formatDate(personal.dob)}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="form-label">
                            <strong>Date of Marriage</strong>
                          </label>
                          <div className="form-control-static border rounded p-2 bg-light">
                            {formatDate(personal.dom)}
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="form-label">
                            <strong>Organisation</strong>
                          </label>
                          <div className="form-control-static border rounded p-2 bg-light">
                            {personal.organisation || "-"}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="form-label">
                            <strong>Designation</strong>
                          </label>
                          <div className="form-control-static border rounded p-2 bg-light">
                            {personal.designation || "-"}
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="form-label">
                            <strong>Annual Income</strong>
                          </label>
                          <div className="form-control-static border rounded p-2 bg-light">
                            {personal.annualIncome || "-"}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="form-label">
                            <strong>Grade</strong>
                          </label>
                          <div className="form-control-static border rounded p-2 bg-light">
                            {personal.grade || "-"}
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="form-label">
                            <strong>Lead Source</strong>
                          </label>
                          <div className="form-control-static border rounded p-2 bg-light">
                            {personal.leadSource || "-"}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <label className="form-label">
                            <strong>Lead Name</strong>
                          </label>
                          <div className="form-control-static border rounded p-2 bg-light">
                            {personal.leadName || "-"}
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={12}>
                        <div className="mb-3">
                          <label className="form-label">
                            <strong>Residential Address</strong>
                          </label>
                          <div className="form-control-static border rounded p-2 bg-light">
                            {personal.resiAddr || "-"}
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={12}>
                        <div className="mb-3">
                          <label className="form-label">
                            <strong>Remarks</strong>
                          </label>
                          <div className="form-control-static border rounded p-2 bg-light">
                            {personal.remark || "-"}
                          </div>
                        </div>
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
                      Family Members ({familyMembers.length})
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
                    {!financialInfo ? (
                      <Alert variant="info">
                        No financial information available.
                      </Alert>
                    ) : (
                      <>
                        {/* Insurance */}
                        <h6 className="text-success mb-3">Insurance</h6>
                        {financialInfo.insurance?.length > 0 ? (
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
                                {financialInfo.insurance.map((ins, idx) => (
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
                        {financialInfo.investments?.length > 0 ? (
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
                                {financialInfo.investments.map((inv, idx) => (
                                  <tr key={idx}>
                                    <td>{inv.financialProduct || "-"}</td>
                                    <td>{inv.companyName || "-"}</td>
                                    <td>{inv.planName || "-"}</td>
                                    <td>{inv.amount || "-"}</td>
                                    <td>{formatDate(inv.startDate)}</td>
                                    <td>{formatDate(inv.maturityDate)}</td>
                                  </tr>
                                ))}
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
                        {financialInfo.loans?.length > 0 ? (
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
                                {financialInfo.loans.map((loan, idx) => (
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
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {callHistory.length === 0 ? (
                      <Alert variant="info">No call history available.</Alert>
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
                                      ? `${formatDate(
                                          call.nextAppointmentDate
                                        )} ${call.nextAppointmentTime || ""}`
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
                        {futurePriorities.length > 0 ? (
                          <ul className="list-group">
                            {futurePriorities.map((priority, idx) => (
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
                          <Alert variant="info">
                            No future priorities set.
                          </Alert>
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
                        {proposedPlan.length > 0 ? (
                          <ul className="list-group">
                            {proposedPlan.map((plan, idx) => (
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
                          <Alert variant="info">
                            No proposed plans available.
                          </Alert>
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
                        {needs ? (
                          <Row>
                            <Col md={6}>
                              <p>
                                <strong>Financial Products:</strong>{" "}
                                {needs.financialProducts || "-"}
                              </p>
                              <p>
                                <strong>Any Correction:</strong>{" "}
                                {needs.anyCorrection || "-"}
                              </p>
                              <p>
                                <strong>Any Updation:</strong>{" "}
                                {needs.anyUpdation || "-"}
                              </p>
                            </Col>
                            <Col md={6}>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={needs.financialCalculation}
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
                                  checked={needs.assesmentOfNeed}
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
                                  checked={needs.portfolioManagement}
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
                                  checked={needs.doorStepServices}
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
        </>
      )}
    </Container>
  );
};

export default SuspectDetailsPage;
