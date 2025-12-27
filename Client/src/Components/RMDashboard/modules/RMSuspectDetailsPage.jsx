import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Spinner,
  Alert,
  Tabs,
  Tab,
  Table,
  Accordion,
  Badge,
  Modal,
} from "react-bootstrap";
import {
  FiArrowLeft,
  FiUser,
  FiEdit,
  FiSave,
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiPhone,
  FiMail,
  FiMapPin,
  FiBriefcase,
  FiHome,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import {
  FaMoneyBillWave,
  FaBullseye,
  FaTasks,
  FaBusinessTime,
} from "react-icons/fa";
import { toast } from "react-toastify";

// Import form components from SuspectDetail
import PersonalDetailsFormForSuspect from "../../Customer/Suspect/PersonalDetailFormSuspect";
import FamilyMembersFormForSuspect from "../../Customer/Suspect/FamilyMembersFormSuspect";
import FinancialInformationFormForSuspect from "../../Customer/Suspect/FinancialInformationFormSuspect";
import FuturePrioritiesFormForSuspect from "../../Customer/Suspect/FuturePrioritiesFromSuspect";
import ProposedPlanFormForSuspect from "../../Customer/Suspect/ProposedPanFormSuspect";

const RMSuspectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Main states
  const [suspect, setSuspect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");

  // Modal states from SuspectDetail
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalType, setEditModalType] = useState("");
  const [editFormData, setEditFormData] = useState(null);
  const [savingModal, setSavingModal] = useState(false);

  // Helper functions from SuspectDetail
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Check if data exists (from SuspectDetail)
  const hasData = (type) => {
    if (!suspect) return false;

    switch (type) {
      case "personal":
        return (
          suspect.personalDetails &&
          Object.keys(suspect.personalDetails).length > 0
        );
      case "family":
        return suspect.familyMembers && suspect.familyMembers.length > 0;
      case "financial":
        const financialData = suspect.financialInfo || {};
        return (
          financialData.insurance?.length > 0 ||
          financialData.investments?.length > 0 ||
          financialData.loans?.length > 0
        );
      case "futurePriorities":
        return suspect.futurePriorities && suspect.futurePriorities.length > 0;
      case "proposedPlan":
        return suspect.proposedPlan && suspect.proposedPlan.length > 0;
      default:
        return false;
    }
  };

  // Fetch suspect details
  useEffect(() => {
    const fetchSuspectDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/suspect/${id}`);

        if (response.data?.success) {
          setSuspect(response.data.suspect);
        } else {
          setError("Failed to fetch suspect details");
        }
      } catch (error) {
        console.error("❌ Error fetching suspect:", error);
        setError(error.response?.data?.message || "Network error");
      } finally {
        setLoading(false);
      }
    };

    if (id && id !== "undefined") {
      fetchSuspectDetails();
    } else {
      setError("Invalid suspect ID");
      setLoading(false);
    }
  }, [id]);

  // Modal functions from SuspectDetail
  const handleOpenEditModal = (type) => {
    setEditModalType(type);

    if (suspect) {
      switch (type) {
        case "personal":
          setEditFormData(suspect.personalDetails || {});
          break;
        case "family":
          setEditFormData(suspect.familyMembers || []);
          break;
        case "financial":
          setEditFormData(
            suspect.financialInfo || {
              insurance: [],
              investments: [],
              loans: [],
            }
          );
          break;
        case "futurePriorities":
          setEditFormData({
            futurePriorities: suspect.futurePriorities || [],
            needs: suspect.needs || {},
          });
          break;
        case "proposedPlan":
          setEditFormData(suspect.proposedPlan || []);
          break;
      }
    } else {
      // Initialize empty
      switch (type) {
        case "personal":
          setEditFormData({});
          break;
        case "family":
          setEditFormData([]);
          break;
        case "financial":
          setEditFormData({ insurance: [], investments: [], loans: [] });
          break;
        case "futurePriorities":
          setEditFormData({ futurePriorities: [], needs: {} });
          break;
        case "proposedPlan":
          setEditFormData([]);
          break;
      }
    }

    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditModalType("");
    setEditFormData(null);
  };

  const handleFormDataUpdate = (data) => {
    setEditFormData(data);
  };

  // Save modal data - Smart create/update
  const handleSaveModalData = async () => {
    if (!id || !editModalType || !editFormData) return;

    setSavingModal(true);
    try {
      let result;
      const existingData = hasData(editModalType);

      if (editModalType === "personal") {
        result = await axios.put(`/api/suspect/update/personaldetails/${id}`, {
          personalDetails: editFormData,
        });
      } else if (existingData) {
        // UPDATE existing data
        switch (editModalType) {
          case "family":
            result = await axios.put(`/api/suspect/${id}/family`, {
              familyMembers: editFormData,
            });
            break;
          case "financial":
            result = await axios.put(
              `/api/suspect/${id}/financial`,
              editFormData
            );
            break;
          case "futurePriorities":
            result = await axios.put(`/api/suspect/${id}/priorities`, {
              futurePriorities: editFormData.futurePriorities,
              needs: editFormData.needs,
            });
            break;
          case "proposedPlan":
            result = await axios.put(`/api/suspect/${id}/proposed-plan`, {
              proposedPlan: editFormData,
            });
            break;
        }
      } else {
        // CREATE new data
        switch (editModalType) {
          case "family":
            result = await axios.post(`/api/suspect/${id}/family/create`, {
              membersArray: editFormData,
            });
            break;
          case "financial":
            const formData = new FormData();
            formData.append("financialData", JSON.stringify(editFormData));
            result = await axios.post(
              `/api/suspect/${id}/financial/create`,
              formData
            );
            break;
          case "futurePriorities":
            result = await axios.post(`/api/suspect/${id}/priorities/create`, {
              futurePriorities: editFormData.futurePriorities,
              needs: editFormData.needs,
            });
            break;
          case "proposedPlan":
            const planFormData = new FormData();
            planFormData.append("formData", JSON.stringify(editFormData));
            result = await axios.post(
              `/api/suspect/${id}/proposed-plan/create`,
              planFormData
            );
            break;
        }
      }

      if (result?.data?.success) {
        const refreshResponse = await axios.get(`/api/suspect/${id}`);
        if (refreshResponse.data?.success) {
          setSuspect(refreshResponse.data.suspect);
        }

        toast.success(
          existingData
            ? `${editModalType} updated successfully!`
            : `${editModalType} added successfully!`
        );
        handleCloseEditModal();
      }
    } catch (error) {
      console.error("❌ Error saving data:", error);
      toast.error(
        error.response?.data?.message || `Failed to save ${editModalType} data`
      );
    } finally {
      setSavingModal(false);
    }
  };

  // UPDATED: SIMPLE BUTTON - NO HOVER EFFECTS with fixed styling
  const renderEditButton = (type, label) => {
    const hasExistingData = hasData(type);

    return (
      <button
        type="button"
        onClick={() => handleOpenEditModal(type)}
        className="edit-button-custom"
        style={{
          padding: "6px 12px",
          fontSize: "14px",
          borderRadius: "4px",
          border: "1px solid #0d6efd",
          backgroundColor: hasExistingData ? "transparent" : "#0d6efd",
          color: hasExistingData ? "#0d6efd" : "white",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          position: "absolute",
          right: "15px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          // NO TRANSITION - NO HOVER EFFECTS
          transition: "none",
          textDecoration: "none",
          fontWeight: "500",
          lineHeight: "1.5",
          // Remove all hover states
          ":hover": {
            backgroundColor: hasExistingData ? "transparent" : "#0d6efd",
            color: hasExistingData ? "#0d6efd" : "white",
            borderColor: "#0d6efd",
            textDecoration: "none",
            transform: "translateY(-50%)",
          },
          ":active": {
            backgroundColor: hasExistingData ? "transparent" : "#0d6efd",
            color: hasExistingData ? "#0d6efd" : "white",
            borderColor: "#0d6efd",
            transform: "translateY(-50%)",
          },
          ":focus": {
            backgroundColor: hasExistingData ? "transparent" : "#0d6efd",
            color: hasExistingData ? "#0d6efd" : "white",
            borderColor: "#0d6efd",
            transform: "translateY(-50%)",
            boxShadow: "none",
          },
        }}
      >
        {hasExistingData ? <FiEdit size={14} /> : <FiPlus size={14} />}
        {hasExistingData ? `Edit ${label}` : `Add ${label}`}
      </button>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading suspect details...</p>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Error</h4>
          <p>{error}</p>
          <Button
            variant="outline-danger"
            onClick={() => navigate("/rm/dashboard")}
          >
            <FiArrowLeft /> Back to Dashboard
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
          <p>Suspect not found</p>
          <Button
            variant="outline-warning"
            onClick={() => navigate("/rm/dashboard")}
          >
            <FiArrowLeft /> Back to Dashboard
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Container fluid className="py-4">
        {/* Header */}
        <div className="mb-4">
          <Button
            variant="outline-primary"
            onClick={() => navigate("/rm/assigned-suspects")}
            className="mb-3"
          >
            Back to Assigned Tasks
          </Button>

          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="mb-1">
                <FiUser className="me-2" />
                {suspect.personalDetails?.groupName || "Unknown Suspect"}
              </h3>
              <p className="text-muted mb-0">
                Group Code:{" "}
                <Badge bg="info">
                  {suspect.personalDetails?.groupCode || "N/A"}
                </Badge>{" "}
                | Status:{" "}
                <Badge
                  bg={suspect.status === "suspect" ? "warning" : "success"}
                >
                  {suspect.status?.toUpperCase()}
                </Badge>{" "}
                | Mobile: {suspect.personalDetails?.mobileNo || "N/A"}
              </p>
            </div>
            <div className="text-end">
              <small className="text-muted">
                Assigned on: {formatDate(suspect.assignedToRMAt)}
              </small>
              <br />
              <small className="text-muted">
                Assigned to: {suspect.assignedToRMName} (
                {suspect.assignedToRMCode})
              </small>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
          fill
        >
          {/* PERSONAL DETAILS TAB */}
          <Tab
            eventKey="personal"
            title={
              <span>
                <FiUser className="me-1" /> Personal Details
              </span>
            }
          >
            <Card>
              <Card.Header
                className="bg-primary text-white d-flex align-items-center justify-content-between"
                style={{ position: "relative", minHeight: "55px" }}
              >
                <h5 className="mb-0">
                  <FiUser className="me-2" />
                  Personal Information
                </h5>
                {renderEditButton("personal", "Details")}
              </Card.Header>
              <Card.Body>
                {suspect?.personalDetails ? (
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">Full Name</label>
                        <p className="fw-semibold fs-6 mb-1">
                          {suspect.personalDetails.name ||
                            suspect.personalDetails.groupName ||
                            "N/A"}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Mobile</label>
                        <p className="fw-semibold fs-6 mb-1">
                          <FiPhone className="me-1" />
                          {suspect.personalDetails.mobileNo || "N/A"}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Email</label>
                        <p className="fw-semibold fs-6 mb-1">
                          <FiMail className="me-1" />
                          {suspect.personalDetails.emailId || "N/A"}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">
                          Date of Birth
                        </label>
                        <p className="fw-semibold fs-6 mb-1">
                          <FiCalendar className="me-1" />
                          {formatDate(suspect.personalDetails.dob)}
                          {suspect.personalDetails.dob && (
                            <span className="text-muted ms-2">
                              ({calculateAge(suspect.personalDetails.dob)}{" "}
                              years)
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">
                          Date of Marriage
                        </label>
                        <p className="fw-semibold fs-6 mb-1">
                          <FiCalendar className="me-1" />
                          {formatDate(suspect.personalDetails.dom)}
                        </p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">Organization</label>
                        <p className="fw-semibold fs-6 mb-1">
                          <FiBriefcase className="me-1" />
                          {suspect.personalDetails.organisation || "N/A"}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Designation</label>
                        <p className="fw-semibold fs-6 mb-1">
                          {suspect.personalDetails.designation || "N/A"}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">
                          Annual Income
                        </label>
                        <p className="fw-semibold fs-6 mb-1">
                          <FiDollarSign className="me-1" />
                          {formatCurrency(suspect.personalDetails.annualIncome)}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Lead Source</label>
                        <p className="fw-semibold fs-6 mb-1">
                          {suspect.personalDetails.leadSource || "N/A"}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">City</label>
                        <p className="fw-semibold fs-6 mb-1">
                          <FiMapPin className="me-1" />
                          {suspect.personalDetails.city || "N/A"}
                        </p>
                      </div>
                    </Col>
                  </Row>
                ) : (
                  <Alert variant="info" className="mt-3">
                    No personal details available. Click "Add Details" to add.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Tab>

          {/* FAMILY MEMBERS TAB */}
          <Tab
            eventKey="family"
            title={
              <span>
                <FiUsers className="me-1" /> Family Members
              </span>
            }
          >
            <Card>
              <Card.Header
                className="bg-primary text-white d-flex align-items-center justify-content-between"
                style={{ position: "relative", minHeight: "55px" }}
              >
                <h5 className="mb-0">
                  <FiUsers className="me-2" />
                  Family Members ({suspect?.familyMembers?.length || 0})
                </h5>
                {renderEditButton("family", "Family")}
              </Card.Header>
              <Card.Body>
                {suspect?.familyMembers?.length > 0 ? (
                  <Row>
                    {suspect.familyMembers
                      .filter(
                        (member) => member?.relation?.toLowerCase() !== "self"
                      )
                      .map((member, index) => (
                        <Col md={6} lg={4} className="mb-3" key={index}>
                          <div className="card h-100 border">
                            <div className="card-body">
                              <div className="d-flex align-items-center mb-3">
                                <div
                                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                                  style={{ width: "40px", height: "40px" }}
                                >
                                  {member?.name?.charAt(0) || "F"}
                                </div>
                                <div>
                                  <h6 className="mb-0">
                                    {member.name || "N/A"}
                                  </h6>
                                  <small className="text-muted">
                                    {member.relation || "N/A"}
                                  </small>
                                </div>
                              </div>
                              <div className="small">
                                <div className="mb-2">
                                  <strong>Age:</strong>{" "}
                                  <span className="text-primary">
                                    {member.dobActual
                                      ? `${calculateAge(
                                          member.dobActual
                                        )} years`
                                      : "N/A"}
                                  </span>
                                </div>
                                <div className="mb-2">
                                  <strong>Income:</strong>{" "}
                                  <span className="text-success">
                                    {formatCurrency(member.annualIncome)}
                                  </span>
                                </div>
                                <div>
                                  <strong>Occupation:</strong>{" "}
                                  <span>{member.occupation || "N/A"}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Col>
                      ))}
                  </Row>
                ) : (
                  <Alert variant="info" className="mt-3">
                    No family members added. Click "Add Family" to add.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Tab>

          {/* FINANCIAL INFORMATION TAB */}
          <Tab
            eventKey="financial"
            title={
              <span>
                <FiDollarSign className="me-1" /> Financial Info
              </span>
            }
          >
            <Card>
              <Card.Header
                className="bg-primary text-white d-flex align-items-center justify-content-between"
                style={{ position: "relative", minHeight: "55px" }}
              >
                <h5 className="mb-0">
                  <FiDollarSign className="me-2" />
                  Financial Information
                </h5>
                {renderEditButton("financial", "Financial Info")}
              </Card.Header>
              <Card.Body>
                <Row className="mb-4">
                  <Col md={4}>
                    <div
                      className="card text-white mb-3 border-0"
                      style={{
                        background: "linear-gradient(135deg, #2c3e50, #3498db)",
                      }}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h5 className="mb-1">Insurance</h5>
                            <p className="mb-0 fs-6">
                              {suspect?.financialInfo?.insurance?.length || 0}{" "}
                              policies
                            </p>
                          </div>
                          <FiDollarSign size={24} />
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div
                      className="card text-white mb-3 border-0"
                      style={{
                        background: "linear-gradient(135deg, #27ae60, #2ecc71)",
                      }}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h5 className="mb-1">Investments</h5>
                            <p className="mb-0 fs-6">
                              {suspect?.financialInfo?.investments?.length || 0}{" "}
                              investments
                            </p>
                          </div>
                          <FiDollarSign size={24} />
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div
                      className="card text-white mb-3 border-0"
                      style={{
                        background: "linear-gradient(135deg, #c0392b, #e74c3c)",
                      }}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h5 className="mb-1">Loans</h5>
                            <p className="mb-0 fs-6">
                              {suspect?.financialInfo?.loans?.length || 0} loans
                            </p>
                          </div>
                          <FiDollarSign size={24} />
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>

                <Accordion defaultActiveKey="0">
                  {/* Insurance Details */}
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>
                      <FiCheckCircle className="me-2" />
                      Insurance Policies (
                      {suspect?.financialInfo?.insurance?.length || 0})
                    </Accordion.Header>
                    <Accordion.Body>
                      {suspect?.financialInfo?.insurance?.length > 0 ? (
                        <div className="table-responsive">
                          <Table striped bordered hover size="sm">
                            <thead className="table-dark">
                              <tr>
                                <th>Policy No</th>
                                <th>Plan Name</th>
                                <th>Company</th>
                                <th>Member</th>
                                <th>Sum Assured</th>
                                <th>Premium</th>
                                <th>Start Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {suspect.financialInfo.insurance.map(
                                (item, index) => (
                                  <tr key={index}>
                                    <td className="fw-semibold">
                                      {item.policyNumber || "N/A"}
                                    </td>
                                    <td>{item.planName || "N/A"}</td>
                                    <td>{item.insuranceCompany || "N/A"}</td>
                                    <td>
                                      <Badge bg="info">
                                        {item.memberName || "N/A"}
                                      </Badge>
                                    </td>
                                    <td className="text-success fw-semibold">
                                      {formatCurrency(item.sumAssured)}
                                    </td>
                                    <td className="text-primary">
                                      {formatCurrency(item.premium)}
                                    </td>
                                    <td>{formatDate(item.startDate)}</td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </Table>
                        </div>
                      ) : (
                        <Alert variant="info" className="mt-2">
                          No insurance policies found
                        </Alert>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>

                  {/* Investment Details */}
                  <Accordion.Item eventKey="1">
                    <Accordion.Header>
                      <FiBriefcase className="me-2" />
                      Investments (
                      {suspect?.financialInfo?.investments?.length || 0})
                    </Accordion.Header>
                    <Accordion.Body>
                      {suspect?.financialInfo?.investments?.length > 0 ? (
                        <div className="table-responsive">
                          <Table striped bordered hover size="sm">
                            <thead className="table-dark">
                              <tr>
                                <th>Company</th>
                                <th>Product</th>
                                <th>Plan Name</th>
                                <th>Member</th>
                                <th>Amount</th>
                                <th>Start Date</th>
                                <th>Maturity Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {suspect.financialInfo.investments.map(
                                (item, index) => (
                                  <tr key={index}>
                                    <td>{item.companyName || "N/A"}</td>
                                    <td>
                                      <Badge bg="secondary">
                                        {item.financialProduct || "N/A"}
                                      </Badge>
                                    </td>
                                    <td className="fw-semibold">
                                      {item.planName || "N/A"}
                                    </td>
                                    <td>
                                      <Badge bg="info">
                                        {item.memberName || "N/A"}
                                      </Badge>
                                    </td>
                                    <td className="text-success fw-semibold">
                                      {formatCurrency(item.amount)}
                                    </td>
                                    <td>{formatDate(item.startDate)}</td>
                                    <td className="text-danger">
                                      {formatDate(item.maturityDate)}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </Table>
                        </div>
                      ) : (
                        <Alert variant="info" className="mt-2">
                          No investments found
                        </Alert>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>

                  {/* Loan Details */}
                  <Accordion.Item eventKey="2">
                    <Accordion.Header>
                      <FiHome className="me-2" />
                      Loans ({suspect?.financialInfo?.loans?.length || 0})
                    </Accordion.Header>
                    <Accordion.Body>
                      {suspect?.financialInfo?.loans?.length > 0 ? (
                        <div className="table-responsive">
                          <Table striped bordered hover size="sm">
                            <thead className="table-dark">
                              <tr>
                                <th>Account No</th>
                                <th>Loan Type</th>
                                <th>Company</th>
                                <th>Member</th>
                                <th>Outstanding</th>
                                <th>Interest Rate</th>
                                <th>Start Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {suspect.financialInfo.loans.map(
                                (item, index) => (
                                  <tr key={index}>
                                    <td className="fw-semibold">
                                      {item.loanAccountNumber || "N/A"}
                                    </td>
                                    <td>
                                      <Badge bg="warning" text="dark">
                                        {item.loanType || "N/A"}
                                      </Badge>
                                    </td>
                                    <td>{item.companyName || "N/A"}</td>
                                    <td>
                                      <Badge bg="info">
                                        {item.memberName || "N/A"}
                                      </Badge>
                                    </td>
                                    <td className="text-danger fw-semibold">
                                      {formatCurrency(item.outstandingAmount)}
                                    </td>
                                    <td className="text-primary">
                                      {item.interestRate
                                        ? `${item.interestRate}%`
                                        : "N/A"}
                                    </td>
                                    <td>{formatDate(item.startDate)}</td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </Table>
                        </div>
                      ) : (
                        <Alert variant="info" className="mt-2">
                          No loans found
                        </Alert>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Card.Body>
            </Card>
          </Tab>

          {/* FUTURE PRIORITIES TAB */}
          <Tab
            eventKey="priorities"
            title={
              <span>
                <FiCalendar className="me-1" /> Future Priorities
              </span>
            }
          >
            <Card>
              <Card.Header
                className="bg-primary text-white d-flex align-items-center justify-content-between"
                style={{ position: "relative", minHeight: "55px" }}
              >
                <h5 className="mb-0">
                  <FiCalendar className="me-2" />
                  Future Priorities & Needs
                </h5>
                {renderEditButton("futurePriorities", "Priorities")}
              </Card.Header>
              <Card.Body>
                {suspect?.futurePriorities?.length > 0 ? (
                  <>
                    <Row>
                      {suspect.futurePriorities.map((priority, index) => (
                        <Col md={6} lg={4} className="mb-3" key={index}>
                          <div className="card h-100 border">
                            <div className="card-header bg-info text-white">
                              <h6 className="mb-0 d-flex align-items-center">
                                <FiCalendar className="me-2" />
                                {priority.priorityName || "Priority"}
                              </h6>
                            </div>
                            <div className="card-body">
                              <div className="mb-3">
                                <strong>Amount Required:</strong>
                                <div className="text-success fw-bold fs-5 mt-1">
                                  {priority.approxAmount
                                    ? formatCurrency(priority.approxAmount)
                                    : "Not specified"}
                                </div>
                              </div>
                              <div className="mb-3">
                                <strong>Duration:</strong>
                                <div className="text-primary fw-semibold">
                                  {priority.duration || "Not specified"}
                                </div>
                              </div>
                              <div className="mb-3">
                                <strong>Family Members Involved:</strong>
                                <div>
                                  {priority.members?.length > 0 ? (
                                    <div className="d-flex flex-wrap gap-1 mt-2">
                                      {priority.members.map((member, i) => (
                                        <span
                                          key={i}
                                          className="badge bg-light text-dark border"
                                        >
                                          {member}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-muted">
                                      Not specified
                                    </span>
                                  )}
                                </div>
                              </div>
                              {priority.remark && (
                                <div className="mt-3 pt-3 border-top">
                                  <strong>Remarks:</strong>
                                  <p className="text-muted small mb-0 mt-1">
                                    {priority.remark}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                    <div className="mt-4 p-4 bg-light rounded border">
                      <div className="row text-center">
                        <div className="col-md-6 mb-3 mb-md-0">
                          <h6 className="text-muted">Total Priorities</h6>
                          <span className="badge bg-info fs-4 px-3 py-2">
                            {suspect.futurePriorities.length}
                          </span>
                        </div>
                        <div className="col-md-6">
                          <h6 className="text-muted">Total Estimated Amount</h6>
                          <div className="text-success fw-bold fs-4">
                            {formatCurrency(
                              suspect.futurePriorities.reduce(
                                (total, p) => total + (p.approxAmount || 0),
                                0
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <Alert variant="info" className="mt-3">
                    No future priorities added. Click "Add Priorities" to add.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Tab>

          {/* PROPOSED PLAN TAB */}
          <Tab
            eventKey="proposed"
            title={
              <span>
                <FiFileText className="me-1" /> Proposed Plan
              </span>
            }
          >
            <Card>
              <Card.Header
                className="bg-primary text-white d-flex align-items-center justify-content-between"
                style={{ position: "relative", minHeight: "55px" }}
              >
                <h5 className="mb-0">
                  <FiFileText className="me-2" />
                  Proposed Financial Plan
                </h5>
                {renderEditButton("proposedPlan", "Plan")}
              </Card.Header>
              <Card.Body>
                {suspect?.proposedPlan?.length > 0 ? (
                  <Row>
                    {suspect.proposedPlan.map((plan, index) => (
                      <Col md={6} lg={4} className="mb-3" key={index}>
                        <div className="card h-100 border">
                          <div className="card-header bg-warning text-dark">
                            <h6 className="mb-0 d-flex align-items-center">
                              <FiFileText className="me-2" />
                              Plan {index + 1}
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="mb-3">
                              <strong>Plan Name:</strong>
                              <div className="fw-semibold text-primary">
                                {plan.planName || "N/A"}
                              </div>
                            </div>
                            <div className="mb-3">
                              <strong>Member:</strong>
                              <div>
                                <Badge bg="info">
                                  {plan.memberName || "N/A"}
                                </Badge>
                              </div>
                            </div>
                            <div className="mb-3">
                              <strong>Product Type:</strong>
                              <div>
                                <Badge bg="secondary">
                                  {plan.financialProduct || "N/A"}
                                </Badge>
                              </div>
                            </div>
                            <div className="mb-3">
                              <strong>Proposed Date:</strong>
                              <div className="text-muted">
                                {formatDate(plan.createdDate)}
                              </div>
                            </div>
                            {plan.status && (
                              <div className="mt-3 pt-3 border-top">
                                <strong>Status:</strong>
                                <div className="mt-1">
                                  <Badge
                                    bg={
                                      plan.status === "Proposed"
                                        ? "info"
                                        : plan.status === "Accepted"
                                        ? "success"
                                        : plan.status === "Rejected"
                                        ? "danger"
                                        : "secondary"
                                    }
                                    className="px-3 py-1"
                                  >
                                    {plan.status}
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert variant="info" className="mt-3">
                    No proposed plans added. Click "Add Plan" to add.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Tab>

          {/* CALL HISTORY TAB */}
          <Tab
            eventKey="calls"
            title={
              <span>
                <FiPhone className="me-1" /> Call History
              </span>
            }
          >
            <Card>
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <FiPhone className="me-2" />
                  Call History ({suspect?.callTasks?.length || 0})
                </h5>
              </Card.Header>
              <Card.Body>
                {suspect?.callTasks?.length === 0 ? (
                  <Alert variant="info" className="mt-3">
                    No call history available
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table bordered hover className="align-middle">
                      <thead className="table-dark">
                        <tr>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Status</th>
                          <th>Remarks</th>
                          <th>Next Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {suspect.callTasks.map((call, index) => (
                          <tr key={index}>
                            <td className="fw-semibold">
                              {formatDate(call.taskDate)}
                            </td>
                            <td>
                              <Badge bg="secondary">{call.taskTime}</Badge>
                            </td>
                            <td>
                              <Badge
                                bg={
                                  call.taskStatus === "Appointment Scheduled"
                                    ? "success"
                                    : call.taskStatus === "Callback"
                                    ? "warning"
                                    : call.taskStatus === "Completed"
                                    ? "primary"
                                    : "secondary"
                                }
                                className="px-3 py-1"
                              >
                                {call.taskStatus}
                              </Badge>
                            </td>
                            <td>
                              <small>{call.taskRemarks || "-"}</small>
                            </td>
                            <td>
                              {call.nextAppointmentDate ? (
                                <div>
                                  <small className="text-success fw-semibold">
                                    Appointment:
                                  </small>
                                  <br />
                                  <small>
                                    {formatDate(call.nextAppointmentDate)}{" "}
                                    {call.nextAppointmentTime}
                                  </small>
                                </div>
                              ) : call.nextFollowUpDate ? (
                                <div>
                                  <small className="text-warning fw-semibold">
                                    Follow-up:
                                  </small>
                                  <br />
                                  <small>
                                    {formatDate(call.nextFollowUpDate)}{" "}
                                    {call.nextFollowUpTime}
                                  </small>
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </Container>

      {/* EDIT MODAL */}
      <Modal
        show={showEditModal}
        onHide={handleCloseEditModal}
        size="xl"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {hasData(editModalType)
              ? `Edit ${editModalType}`
              : `Add ${editModalType}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {savingModal ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Saving data...</p>
            </div>
          ) : (
            <>
              {editModalType === "personal" && (
                <PersonalDetailsFormForSuspect
                  isEdit={true}
                  suspectData={{ personalDetails: editFormData }}
                  onFormDataUpdate={handleFormDataUpdate}
                />
              )}

              {editModalType === "family" && (
                <FamilyMembersFormForSuspect
                  suspectId={id}
                  suspectData={{ familyMembers: editFormData }}
                  onDataUpdate={handleFormDataUpdate}
                />
              )}

              {editModalType === "financial" && (
                <FinancialInformationFormForSuspect
                  suspectId={id}
                  suspectData={{ financialInfo: editFormData }}
                  onDataUpdate={handleFormDataUpdate}
                />
              )}

              {editModalType === "futurePriorities" && (
                <FuturePrioritiesFormForSuspect
                  suspectId={id}
                  suspectData={editFormData}
                  onDataUpdate={handleFormDataUpdate}
                />
              )}

              {editModalType === "proposedPlan" && (
                <ProposedPlanFormForSuspect
                  suspectId={id}
                  suspectData={{ proposedPlan: editFormData }}
                  onDataUpdate={handleFormDataUpdate}
                />
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveModalData}
            disabled={savingModal || !editFormData}
          >
            <FiSave className="me-2" />
            {savingModal
              ? "Saving..."
              : hasData(editModalType)
              ? "Update"
              : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Global CSS to remove ALL hover effects */}
      <style jsx global>{`
        /* Remove hover effects from ALL buttons */
        .card .card-header button:hover,
        .card .card-header button:focus,
        .card .card-header button:active {
          background-color: inherit !important;
          color: inherit !important;
          border-color: inherit !important;
          transform: none !important;
          box-shadow: none !important;
          opacity: 1 !important;
          text-decoration: none !important;
          outline: none !important;
        }

        /* Specifically target our custom edit buttons */
        .edit-button-custom:hover,
        .edit-button-custom:focus,
        .edit-button-custom:active {
          background-color: inherit !important;
          color: inherit !important;
          border-color: inherit !important;
          transform: translateY(-50%) !important;
          box-shadow: none !important;
          opacity: 1 !important;
          text-decoration: none !important;
          outline: none !important;
        }

        /* Remove any transition effects */
        .card .card-header button,
        .edit-button-custom {
          transition: none !important;
          -webkit-transition: none !important;
          -moz-transition: none !important;
          -o-transition: none !important;
        }

        /* Ensure buttons are always visible */
        .card .card-header {
          position: relative !important;
        }

        .edit-button-custom {
          visibility: visible !important;
          opacity: 1 !important;
          display: inline-flex !important;
        }

        /* Make sure button text doesn't change on hover */
        .edit-button-custom:hover span,
        .edit-button-custom:focus span,
        .edit-button-custom:active span {
          color: inherit !important;
        }
      `}</style>
    </>
  );
};

export default RMSuspectDetailsPage;
