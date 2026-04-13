import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Button, Spinner, Card, Row, Col, Badge, Modal, Table } from "react-bootstrap";
import { Tabs, Tab, TabList, TabPanel } from "react-tabs";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiBriefcase,
  FiPhoneCall,
  FiCalendar,
  FiDollarSign,
  FiHome,
  FiActivity,
  FiClock,
} from "react-icons/fi";
import {
  FaIdCardAlt,
  FaUsers,
  FaMoneyBillWave,
  FaBullseye,
  FaHistory,
  FaUserTie,
  FaBusinessTime,
  FaTasks,
  FaUserCheck,
} from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import { GrStatusGoodSmall } from "react-icons/gr";
import { getSuspectById } from "../../../redux/feature/SuspectRedux/SuspectThunx";

const SuspectDetailOA = () => {
  const [userData, setUserData] = useState(null);
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const dispatch = useDispatch();

  // Fetch suspect data
  useEffect(() => {
    fetchSuspectData();
  }, [id]);

  const fetchSuspectData = async () => {
    setLoading(true);
    try {
      const res = await dispatch(getSuspectById(id)).unwrap();
      setUserData(res?.suspect);
      console.log("Suspect Data:", res?.suspect);
    } catch (error) {
      console.error("Error fetching suspect:", error);
      toast.error("Failed to load suspect details");
    } finally {
      setLoading(false);
    }
  };

  // Format functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getTaskTypeBadgeClass = (taskType) => {
    switch (taskType?.toLowerCase()) {
      case "compositetask":
        return "bg-purple";
      case "marketingtask":
        return "bg-teal";
      case "servicetask":
        return "bg-orange";
      default:
        return "bg-secondary";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-success";
      case "in-progress":
      case "inprogress":
        return "bg-info";
      case "pending":
        return "bg-warning";
      case "appointment scheduled":
        return "bg-primary";
      case "cancelled":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
      case "urgent":
        return "bg-danger";
      case "medium":
        return "bg-warning";
      case "low":
        return "bg-secondary";
      default:
        return "bg-secondary";
    }
  };

  const handleOpenModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType("");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading suspect details...</span>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="alert alert-danger m-4">
        <h4>❌ Error Loading Data</h4>
        <p>Failed to load suspect details. Please try again.</p>
        <Button variant="primary" onClick={fetchSuspectData}>
          Retry
        </Button>
      </div>
    );
  }

  const personal = userData?.personalDetails || {};
  const callTasks = userData?.callTasks || [];
  const appointmentTasks = callTasks.filter(
    (task) => task.taskStatus === "Appointment Scheduled"
  );

  return (
    <>
      <div className="container customer-profile-container py-4">
        {/* Header Section */}
        <div className="profile-header">
          <h1>Suspect Profile</h1>
          <div className="status-badge">
            <span className={`status-dot ${userData?.status || "suspect"}`}></span>
            {userData?.status || "Suspect"}
          </div>
        </div>

        <div className="profile-grid">
          {/* Profile Card - Left Column */}
          <div className="profile-card">
            <div className="profile-info">
              <div className="text-center mb-3">
                <div
                  className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: "100px", height: "100px" }}
                >
                  <FiUser size={40} color="white" />
                </div>
                <h2 className="profile-name">
                  {personal.groupName || personal.name || "N/A"}
                </h2>
                <div className="profile-meta">
                  <span className="badge bg-info">
                    {personal.groupCode || id?.substring(0, 8)}
                  </span>
                  <span className="badge secondary">
                    Grade: {personal.grade || "N/A"}
                  </span>
                </div>
              </div>

              <div className="detail-item">
                <FiUser className="detail-icon" />
                <div>
                  <p className="detail-label">Name</p>
                  <p className="detail-value">{personal.name || "N/A"}</p>
                </div>
              </div>

              <div className="detail-item">
                <FiUser className="detail-icon" />
                <div>
                  <p className="detail-label">Gender</p>
                  <p className="detail-value">{personal.gender || "N/A"}</p>
                </div>
              </div>

              <div className="detail-item">
                <FiPhone className="detail-icon" />
                <div>
                  <p className="detail-label">Mobile No</p>
                  <p className="detail-value">{personal.mobileNo || "N/A"}</p>
                </div>
              </div>

              <div className="detail-item">
                <FiPhone className="detail-icon" />
                <div>
                  <p className="detail-label">Contact No</p>
                  <p className="detail-value">{personal.contactNo || "N/A"}</p>
                </div>
              </div>

              <div className="detail-item">
                <FiMail className="detail-icon" />
                <div>
                  <p className="detail-label">Email</p>
                  <p className="detail-value">{personal.emailId || "N/A"}</p>
                </div>
              </div>

              <div className="detail-item">
                <GrStatusGoodSmall className="detail-icon" />
                <div>
                  <p className="detail-label">Status</p>
                  <p className="detail-value">{userData?.status || "suspect"}</p>
                </div>
              </div>

              <div className="detail-item">
                <FaUserTie className="detail-icon" />
                <div>
                  <p className="detail-label">Lead Source</p>
                  <p className="detail-value">{personal.leadSource || "N/A"}</p>
                </div>
              </div>

              <div className="detail-item">
                <FaIdCardAlt className="detail-icon" />
                <div>
                  <p className="detail-label">Lead Name</p>
                  <p className="detail-value">{personal.leadName || "N/A"}</p>
                </div>
              </div>

              <div className="profile-stats">
                <div className="stat-item">
                  <p className="stat-value">{callTasks.length}</p>
                  <p className="stat-label">Call Tasks</p>
                </div>
                <div className="stat-item">
                  <p className="stat-value">{appointmentTasks.length}</p>
                  <p className="stat-label">Appointments</p>
                </div>
                <div className="stat-item">
                  <p className="stat-value">
                    {userData?.familyMembers?.length || 0}
                  </p>
                  <p className="stat-label">Family Members</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area - Right Column */}
          <div className="content-area">
            {/* Quick Info Cards */}
            <div className="info-cards">
              <div className="info-card">
                <div className="info-icon">
                  <FiCalendar size={24} />
                </div>
                <div>
                  <h3>Created On</h3>
                  <p>{formatDate(userData.createdAt)}</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">
                  <FiPhoneCall size={24} />
                </div>
                <div>
                  <h3>Calling Purpose</h3>
                  <p>{personal.callingPurpose || "N/A"}</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">
                  <FaIdCardAlt size={24} />
                </div>
                <div>
                  <h3>{personal.leadSource || "N/A"}</h3>
                  <p>{personal.leadName || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Tabs Container */}
            <div className="tabs-container">
              <Tabs
                selectedIndex={tabIndex}
                onSelect={(index) => setTabIndex(index)}
              >
                <TabList className="custom-tablist">
                  <Tab
                    className={`custom-tab ${tabIndex === 0 ? "active" : ""}`}
                  >
                    <FiUser className="tab-icon" />
                    <span>Personal Details</span>
                  </Tab>
                  <Tab
                    className={`custom-tab ${tabIndex === 1 ? "active" : ""}`}
                  >
                    <FaUsers className="tab-icon" />
                    <span>Family Members</span>
                  </Tab>
                  <Tab
                    className={`custom-tab ${tabIndex === 2 ? "active" : ""}`}
                  >
                    <FaMoneyBillWave className="tab-icon" />
                    <span>Financial Details</span>
                  </Tab>
                  <Tab
                    className={`custom-tab ${tabIndex === 3 ? "active" : ""}`}
                  >
                    <FaBullseye className="tab-icon" />
                    <span>Future Priorities</span>
                  </Tab>
                  <Tab
                    className={`custom-tab ${tabIndex === 4 ? "active" : ""}`}
                  >
                    <FaHistory className="tab-icon" />
                    <span>Call Tasks</span>
                  </Tab>
                </TabList>

                {/* Personal Details Tab */}
                <TabPanel>
                  <div className="profile-details-container p-4">
                    <div className="row g-4">
                      <div className="col-md-12">
                        <div className="card shadow-sm h-100">
                          <div className="card-body">
                            <h5 className="card-title text-primary mb-4 border-bottom pb-2">
                              <FiUser className="me-2" />
                              Basic Information
                            </h5>

                            <div className="row">
                              <div className="col-md-6">
                                <div className="detail-item-box d-flex align-items-center mb-3">
                                  <div className="d-flex flex-grow-1">
                                    <span className="text-muted me-2">Group Code:</span>
                                    <span className="fw-semibold">
                                      {personal.groupCode || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="detail-item-box d-flex align-items-center mb-3">
                                  <div className="d-flex flex-grow-1">
                                    <span className="text-muted me-2">Group Head:</span>
                                    <span className="fw-semibold">
                                      {personal.groupName || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="detail-item-box d-flex align-items-center mb-3">
                                  <div className="d-flex flex-grow-1">
                                    <span className="text-muted me-2">Grade:</span>
                                    <span className="fw-semibold">
                                      {personal.grade || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="detail-item-box d-flex align-items-center mb-3">
                                  <div className="d-flex flex-grow-1">
                                    <span className="text-muted me-2">Gender:</span>
                                    <span className="fw-semibold">
                                      {personal.gender || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="card shadow-sm">
                          <div className="card-body">
                            <h5 className="card-title text-primary mb-4 border-bottom pb-2">
                              <FiBriefcase className="me-2" />
                              Professional Information
                            </h5>

                            <div className="row">
                              <div className="col-md-6">
                                <div className="detail-item-box d-flex align-items-center mb-3">
                                  <div className="d-flex flex-grow-1">
                                    <span className="text-muted me-2">Organization:</span>
                                    <span className="fw-semibold">
                                      {personal.organisation || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="detail-item-box d-flex align-items-center mb-3">
                                  <div className="d-flex flex-grow-1">
                                    <span className="text-muted me-2">Designation:</span>
                                    <span className="fw-semibold">
                                      {personal.designation || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="detail-item-box d-flex align-items-center mb-3">
                                  <div className="d-flex flex-grow-1">
                                    <span className="text-muted me-2">Annual Income:</span>
                                    <span className="fw-semibold">
                                      {personal.annualIncome || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="detail-item-box d-flex align-items-center mb-3">
                                  <div className="d-flex flex-grow-1">
                                    <span className="text-muted me-2">Lead Occupation:</span>
                                    <span className="fw-semibold">
                                      {personal.leadOccupation || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="detail-item-box d-flex align-items-center mb-3">
                                  <div className="d-flex flex-grow-1">
                                    <span className="text-muted me-2">Occupation Type:</span>
                                    <span className="fw-semibold">
                                      {personal.leadOccupationType || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="detail-item-box d-flex align-items-center mb-3">
                                  <div className="d-flex flex-grow-1">
                                    <span className="text-muted me-2">Calling Purpose:</span>
                                    <span className="fw-semibold">
                                      {personal.callingPurpose || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="card shadow-sm">
                          <div className="card-body">
                            <h5 className="card-title text-primary mb-4 border-bottom pb-2">
                              <FiMapPin className="me-2" />
                              Address Information
                            </h5>

                            <div className="row">
                              <div className="col-md-6">
                                <div className="detail-item-box mb-3">
                                  <span className="text-muted d-block">
                                    <FiHome className="me-1" />
                                    Residential Address
                                  </span>
                                  <p className="fw-semibold mb-1">{personal.resiAddr || "N/A"}</p>
                                  {personal.resiLandmark && (
                                    <small className="text-muted">
                                      Landmark: {personal.resiLandmark}
                                    </small>
                                  )}
                                  <br />
                                  {personal.resiPincode && (
                                    <small className="text-muted">
                                      Pincode: {personal.resiPincode}
                                    </small>
                                  )}
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="detail-item-box mb-3">
                                  <span className="text-muted d-block">Office Address</span>
                                  <p className="fw-semibold mb-1">{personal.officeAddr || "N/A"}</p>
                                  {personal.officeLandmark && (
                                    <small className="text-muted">
                                      Landmark: {personal.officeLandmark}
                                    </small>
                                  )}
                                  <br />
                                  {personal.officePincode && (
                                    <small className="text-muted">
                                      Pincode: {personal.officePincode}
                                    </small>
                                  )}
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="detail-item-box mb-3">
                                  <span className="text-muted d-block">
                                    Preferred Meeting Address
                                  </span>
                                  <p className="fw-semibold mb-1">
                                    {personal.preferredMeetingAddr || "N/A"}
                                  </p>
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="detail-item-box mb-3">
                                  <span className="text-muted d-block">Area</span>
                                  <p className="fw-semibold mb-1">
                                    {personal.preferredMeetingArea || "N/A"}
                                  </p>
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="detail-item-box mb-3">
                                  <span className="text-muted d-block">City</span>
                                  <p className="fw-semibold mb-1">{personal.city || "N/A"}</p>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="detail-item-box mb-3">
                                  <span className="text-muted d-block">Best Time to Contact</span>
                                  <p className="fw-semibold mb-1">{personal.bestTime || "N/A"}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="card shadow-sm">
                          <div className="card-body">
                            <h5 className="card-title text-primary mb-4 border-bottom pb-2">
                              <FiPhoneCall className="me-2" />
                              Contact Information
                            </h5>

                            <div className="row">
                              <div className="col-md-6">
                                <div className="detail-item-box mb-3">
                                  <div className="d-flex align-items-center">
                                    <span className="text-muted me-2">📱 Mobile:</span>
                                    <span className="fw-semibold">
                                      {personal.mobileNo || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="detail-item-box mb-3">
                                  <div className="d-flex align-items-center">
                                    <span className="text-muted me-2">🟢 WhatsApp:</span>
                                    <span className="fw-semibold">
                                      {personal.whatsappNo || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="detail-item-box mb-3">
                                  <div className="d-flex align-items-center">
                                    <span className="text-muted me-2">📞 Contact:</span>
                                    <span className="fw-semibold">
                                      {personal.contactNo || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="detail-item-box mb-3">
                                  <div className="d-flex align-items-center">
                                    <span className="text-muted me-2">✉️ Email:</span>
                                    <span className="fw-semibold">
                                      {personal.emailId || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabPanel>

                {/* Family Members Tab */}
                <TabPanel>
                  <div className="tab-content">
                    {userData?.familyMembers?.length > 0 ? (
                      <div className="family-grid">
                        <h3>Family Members</h3>
                        {userData?.familyMembers?.map((member, index) => (
                          <div className="family-card" key={`member-${index}`}>
                            <div className="family-avatar">
                              {member?.name?.charAt(0) || "F"}
                            </div>
                            <div className="family-info">
                              <h3 className="mb-2 fw-semibold">{member?.name || "N/A"}</h3>
                              <p>
                                <strong>Relation:</strong> {member?.relation || "N/A"}
                              </p>
                              <p>
                                <strong>Age:</strong>{" "}
                                {member?.dobActual
                                  ? `${calculateAge(member.dobActual)} years`
                                  : "N/A"}
                              </p>
                              <p>
                                <strong>Annual Income:</strong>{" "}
                                {member?.annualIncome
                                  ? formatCurrency(member.annualIncome)
                                  : "N/A"}
                              </p>
                              <p>
                                <strong>Contact:</strong> {member?.contact || "N/A"}
                              </p>
                              <span className="badge bg-info text-dark">
                                {member?.occupation || "Dependent"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="alert alert-info">
                          <p className="mb-0 text-muted">No family members added yet.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabPanel>

                {/* Financial Details Tab */}
                <TabPanel>
                  <div className="tab-content">
                    <h3>Financial Overview</h3>
                    <Row className="mb-3">
                      <Col md={4}>
                        <div
                          className="financial-card"
                          style={{ background: "darkblue", cursor: "pointer" }}
                          onClick={() => handleOpenModal("insurance")}
                        >
                          <h4>Total Insurance</h4>
                          <p className="meta">
                            Total {userData?.financialInfo?.insurance?.length || 0} policies
                          </p>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div
                          className="financial-card"
                          style={{ background: "green", cursor: "pointer" }}
                          onClick={() => handleOpenModal("investment")}
                        >
                          <h4>Total Investment</h4>
                          <p className="meta">
                            Total {userData?.financialInfo?.investments?.length || 0} Investments
                          </p>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div
                          className="financial-card"
                          style={{ background: "darkred", cursor: "pointer" }}
                          onClick={() => handleOpenModal("loan")}
                        >
                          <h4>Loan & Liabilities</h4>
                          <p className="meta">
                            Total {userData?.financialInfo?.loans?.length || 0} Loans
                          </p>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </TabPanel>

                {/* Future Priorities Tab */}
                <TabPanel>
                  <div className="card-body mb-5">
                    <h5 className="card-title p-3 border-bottom pb-2 mb-2">
                      Future Priorities
                    </h5>

                    {userData?.futurePriorities?.length > 0 ? (
                      <div className="row">
                        {userData?.futurePriorities.map((priority, index) => (
                          <div key={priority._id || index} className="col-md-6 col-lg-4 mb-4">
                            <div className="card h-100 shadow-sm">
                              <div className="card-header bg-info text-dark">
                                <h6 className="mb-0">
                                  {priority.priorityName || "Unnamed Priority"}
                                </h6>
                              </div>
                              <div className="card-body">
                                <div className="mb-3">
                                  <strong>Approximate Amount:</strong>
                                  <div className="text-success fs-5">
                                    {priority.approxAmount
                                      ? formatCurrency(priority.approxAmount)
                                      : "Not specified"}
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <strong>Duration:</strong>
                                  <div>{priority.duration || "Not specified"}</div>
                                </div>
                                <div className="mb-3">
                                  <strong>Members:</strong>
                                  <div>
                                    {priority.members?.length > 0
                                      ? priority.members.map((member, i) => (
                                          <span key={i} className="badge bg-info text-dark me-1 mb-1">
                                            {member}
                                          </span>
                                        ))
                                      : "Not specified"}
                                  </div>
                                </div>
                                {priority.remark && (
                                  <div className="mb-2">
                                    <strong>Remark:</strong>
                                    <div className="text-muted small">{priority.remark}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="alert alert-info">
                          <p className="mb-0 text-muted">No future priorities have been added yet.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabPanel>

                {/* Call Tasks Tab */}
                <TabPanel>
                  <div className="tab-content p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h3 className="fw-bold mb-0">
                        <FaHistory className="me-2" />
                        Call Task History
                      </h3>
                      <span className="badge bg-info text-dark fs-6 px-3 py-2">
                        {callTasks.length} Tasks
                      </span>
                    </div>

                    {callTasks.length > 0 ? (
                      <>
                        {/* Summary Cards */}
                        <div className="row mb-4">
                          <div className="col-md-3 mb-3">
                            <div className="card border-0 shadow-sm bg-primary bg-opacity-10">
                              <div className="card-body text-center">
                                <FiClock className="text-primary fs-3 mb-2" />
                                <h4 className="text-primary">
                                  {callTasks.filter((t) => 
                                    t.taskStatus === "Appointment Scheduled"
                                  ).length}
                                </h4>
                                <p className="text-muted small mb-0">Appointments</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3 mb-3">
                            <div className="card border-0 shadow-sm bg-success bg-opacity-10">
                              <div className="card-body text-center">
                                <FiActivity className="text-success fs-3 mb-2" />
                                <h4 className="text-success">
                                  {callTasks.filter((t) => t.taskStatus === "Completed").length}
                                </h4>
                                <p className="text-muted small mb-0">Completed</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3 mb-3">
                            <div className="card border-0 shadow-sm bg-warning bg-opacity-10">
                              <div className="card-body text-center">
                                <FiClock className="text-warning fs-3 mb-2" />
                                <h4 className="text-warning">
                                  {callTasks.filter((t) => t.taskStatus === "Pending").length}
                                </h4>
                                <p className="text-muted small mb-0">Pending</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3 mb-3">
                            <div className="card border-0 shadow-sm bg-secondary bg-opacity-10">
                              <div className="card-body text-center">
                                <FaHistory className="text-secondary fs-3 mb-2" />
                                <h4 className="text-secondary">{callTasks.length}</h4>
                                <p className="text-muted small mb-0">Total Tasks</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Task List */}
                        <div className="card border-0 shadow-sm">
                          <div className="card-body">
                            <h5 className="card-title mb-4">
                              <FiActivity className="me-2" />
                              Call Task History
                            </h5>
                            <div className="task-list">
                              {callTasks.map((task, index) => (
                                <div
                                  key={task._id || index}
                                  className="task-item mb-4 p-3 border rounded"
                                >
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                      <h6 className="mb-1 fw-bold">
                                        {task.taskName || "Unnamed Task"}
                                      </h6>
                                      <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                                        <span className={`badge ${getTaskTypeBadgeClass(task.taskType)}`}>
                                          {task.taskType || "Task"}
                                        </span>
                                        <span className={`badge ${getStatusBadgeClass(task.taskStatus)}`}>
                                          {task.taskStatus || "pending"}
                                        </span>
                                        <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                                          {task.priority || "medium"}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-end">
                                      <small className="text-muted d-block">
                                        <FiCalendar className="me-1" />
                                        {formatDateTime(task.taskDate)}
                                      </small>
                                    </div>
                                  </div>

                                  {task.taskStatus === "Appointment Scheduled" && (
                                    <div className="row mt-3 p-3 bg-primary bg-opacity-10 rounded">
                                      <div className="col-md-4">
                                        <small className="text-muted d-block">Appointment Date</small>
                                        <strong>{formatDate(task.nextAppointmentDate)}</strong>
                                      </div>
                                      <div className="col-md-4">
                                        <small className="text-muted d-block">Appointment Time</small>
                                        <strong>{task.nextAppointmentTime || "N/A"}</strong>
                                      </div>
                                      <div className="col-md-4">
                                        <small className="text-muted d-block">Scheduled On</small>
                                        <strong>{formatDate(task.taskDate)}</strong>
                                      </div>
                                    </div>
                                  )}

                                  <div className="row mt-3">
                                    <div className="col-md-6">
                                      <div className="mb-3">
                                        <small className="text-muted d-block">Assigned To</small>
                                        <div className="d-flex align-items-center">
                                          <FaUserCheck className="me-2 text-primary" />
                                          <span className="fw-semibold">
                                            {task.assignedTo?.username || 
                                             (typeof task.assignedTo === "object" 
                                               ? task.assignedTo.username 
                                               : "Unassigned")}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-md-6">
                                      <div className="mb-3">
                                        <small className="text-muted d-block">Task Remarks</small>
                                        <div className="fw-semibold">{task.taskRemarks || "N/A"}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-5">
                        <div className="mb-4">
                          <FaHistory className="display-1 text-muted" />
                        </div>
                        <div className="alert alert-info border-0 shadow-sm mx-auto" style={{ maxWidth: "400px" }}>
                          <h5 className="alert-heading mb-2">No Call Tasks</h5>
                          <p className="mb-0">No call task history available for this suspect.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabPanel>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Financial Details Modal */}
        <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {modalType === "insurance" && "Insurance Policies Details"}
              {modalType === "investment" && "Investment Details"}
              {modalType === "loan" && "Loan & Liabilities Details"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table striped bordered hover responsive>
              <thead>
                {modalType === "insurance" && (
                  <tr>
                    <th>Policy Number</th>
                    <th>Plan Name</th>
                    <th>Company</th>
                    <th>Member Name</th>
                    <th>Premium</th>
                    <th>Sum Assured</th>
                    <th>Start Date</th>
                    <th>Maturity Date</th>
                    <th>Mode</th>
                    <th>Submission Date</th>
                  </tr>
                )}
                {modalType === "investment" && (
                  <tr>
                    <th>Company Name</th>
                    <th>Product Type</th>
                    <th>Plan Name</th>
                    <th>Member Name</th>
                    <th>Amount</th>
                    <th>Start Date</th>
                    <th>Maturity Date</th>
                    <th>Submission Date</th>
                  </tr>
                )}
                {modalType === "loan" && (
                  <tr>
                    <th>Account Number</th>
                    <th>Loan Type</th>
                    <th>Company Name</th>
                    <th>Member Name</th>
                    <th>Outstanding Amount</th>
                    <th>Interest Rate</th>
                    <th>Term</th>
                    <th>Start Date</th>
                    <th>Maturity Date</th>
                    <th>Submission Date</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {modalType === "insurance" &&
                  userData?.financialInfo?.insurance?.map((item, index) => (
                    <tr key={item._id || index}>
                      <td>{item.policyNumber || "N/A"}</td>
                      <td>{item.planName || "N/A"}</td>
                      <td>{item.insuranceCompany || "N/A"}</td>
                      <td>{item.memberName || "N/A"}</td>
                      <td>{item.premium ? formatCurrency(item.premium) : "N/A"}</td>
                      <td>{item.sumAssured ? formatCurrency(item.sumAssured) : "N/A"}</td>
                      <td>{formatDate(item.startDate)}</td>
                      <td>{formatDate(item.maturityDate)}</td>
                      <td>{item.mode || "N/A"}</td>
                      <td>{formatDate(item.submissionDate)}</td>
                    </tr>
                  ))}
                {modalType === "investment" &&
                  userData?.financialInfo?.investments?.map((item, index) => (
                    <tr key={item._id || index}>
                      <td>{item.companyName || "N/A"}</td>
                      <td>{item.financialProduct || "N/A"}</td>
                      <td>{item.planName || "N/A"}</td>
                      <td>{item.memberName || "N/A"}</td>
                      <td>{item.amount ? formatCurrency(item.amount) : "N/A"}</td>
                      <td>{formatDate(item.startDate)}</td>
                      <td>{formatDate(item.maturityDate)}</td>
                      <td>{formatDate(item.submissionDate)}</td>
                    </tr>
                  ))}
                {modalType === "loan" &&
                  userData?.financialInfo?.loans?.map((item, index) => (
                    <tr key={item._id || index}>
                      <td>{item.loanAccountNumber || "N/A"}</td>
                      <td>{item.loanType || "N/A"}</td>
                      <td>{item.companyName || "N/A"}</td>
                      <td>{item.memberName || "N/A"}</td>
                      <td>{item.outstandingAmount ? formatCurrency(item.outstandingAmount) : "N/A"}</td>
                      <td>{item.interestRate ? `${item.interestRate}%` : "N/A"}</td>
                      <td>{item.term || "N/A"}</td>
                      <td>{formatDate(item.startDate)}</td>
                      <td>{formatDate(item.maturityDate)}</td>
                      <td>{formatDate(item.submissionDate)}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>

            {modalType === "insurance" &&
              (!userData?.financialInfo?.insurance ||
                userData.financialInfo.insurance.length === 0) && (
                <div className="text-center py-4">
                  <p className="text-muted">No insurance policies found</p>
                </div>
              )}
            {modalType === "investment" &&
              (!userData?.financialInfo?.investments ||
                userData.financialInfo.investments.length === 0) && (
                <div className="text-center py-4">
                  <p className="text-muted">No investments found</p>
                </div>
              )}
            {modalType === "loan" &&
              (!userData?.financialInfo?.loans ||
                userData.financialInfo.loans.length === 0) && (
                <div className="text-center py-4">
                  <p className="text-muted">No loans found</p>
                </div>
              )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* CSS Styles */}
        <style jsx>{`
          .customer-profile-container {
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }

          .profile-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
          }

          .profile-header h1 {
            font-size: 28px;
            font-weight: 600;
            color: #2c3e50;
          }

          .status-badge {
            display: flex;
            align-items: center;
            background: #f8f9fa;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
          }

          .status-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 8px;
          }

          .status-dot.suspect {
            background: #f39c12;
          }

          .status-dot.client {
            background: #28a745;
          }

          .status-dot.prospect {
            background: #3498db;
          }

          .profile-grid {
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 20px;
          }

          .profile-card {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            height: fit-content;
          }

          .profile-info {
            padding: 20px;
          }

          .profile-name {
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 5px 0;
          }

          .profile-meta {
            display: flex;
            gap: 8px;
            margin-bottom: 15px;
            justify-content: center;
          }

          .badge {
            background: #3498db;
            color: white;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
          }

          .badge.secondary {
            background: #6c757d;
          }

          .detail-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid #eee;
          }

          .detail-item:last-child {
            border-bottom: none;
          }

          .detail-icon {
            color: #7f8c8d;
            min-width: 24px;
          }

          .detail-label {
            font-size: 12px;
            color: #7f8c8d;
            margin: 0;
          }

          .detail-value {
            font-size: 14px;
            font-weight: 500;
            margin: 2px 0 0 0;
          }

          .profile-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 20px;
            text-align: center;
          }

          .stat-item {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 8px;
          }

          .stat-value {
            font-size: 20px;
            font-weight: 600;
            margin: 0;
            color: #2c3e50;
          }

          .stat-label {
            font-size: 12px;
            color: #7f8c8d;
            margin: 4px 0 0 0;
          }

          .content-area {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .info-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }

          .info-card {
            background: white;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .info-icon {
            background: #e3f2fd;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #3498db;
          }

          .info-card h3 {
            font-size: 14px;
            color: #7f8c8d;
            margin: 0 0 4px 0;
          }

          .info-card p {
            font-size: 15px;
            font-weight: 500;
            margin: 0;
          }

          .tabs-container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            overflow: hidden;
          }

          .custom-tablist {
            display: flex;
            background: #f8f9fa;
            padding: 0;
            margin: 0;
            list-style: none;
            border-bottom: 1px solid #eee;
            flex-wrap: wrap;
          }

          .custom-tab {
            padding: 15px 20px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            color: #7f8c8d;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
          }

          .custom-tab:hover {
            color: #3498db;
            background: rgba(52, 152, 219, 0.05);
          }

          .custom-tab.active {
            color: #3498db;
            border-bottom: 2px solid #3498db;
            background: white;
          }

          .tab-icon {
            font-size: 16px;
          }

          .tab-content {
            padding: 20px;
          }

          .tab-content h3 {
            font-size: 18px;
            margin-top: 0;
            color: #2c3e50;
          }

          .detail-item-box {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 0.75rem 1rem;
            transition: background-color 0.2s ease;
          }

          .detail-item-box:hover {
            background-color: #e9ecef;
          }

          .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #3498db;
            border-bottom: 2px solid #3498db;
            padding-bottom: 0.5rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
          }

          .family-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
          }

          .family-card {
            background: white;
            border: 1px solid #eee;
            border-radius: 8px;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .family-avatar {
            width: 40px;
            height: 40px;
            background: #e3f2fd;
            color: #3498db;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
          }

          .family-info h3 {
            font-size: 14px;
            margin: 0 0 4px 0;
          }

          .family-info p {
            font-size: 12px;
            color: #7f8c8d;
            margin: 0 0 4px 0;
          }

          .financial-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }

          .financial-card {
            padding: 15px;
            border-radius: 8px;
            color: white;
          }

          .financial-card h4 {
            font-size: 14px;
            margin: 0 0 10px 0;
            font-weight: 500;
          }

          .amount {
            font-size: 22px;
            font-weight: 600;
            margin: 0 0 5px 0;
          }

          .meta {
            font-size: 12px;
            opacity: 0.9;
            margin: 0;
          }

          .task-list {
            border: 1px solid #eee;
            border-radius: 8px;
            overflow: hidden;
          }

          .task-item {
            display: flex;
            flex-direction: column;
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
            background: white;
          }

          .task-item:last-child {
            border-bottom: none;
          }

          .bg-purple {
            background-color: #6f42c1;
            color: white;
          }

          .bg-teal {
            background-color: #20c997;
            color: white;
          }

          .bg-orange {
            background-color: #fd7e14;
            color: white;
          }

          @media (max-width: 768px) {
            .profile-grid {
              grid-template-columns: 1fr;
            }
            
            .info-cards {
              grid-template-columns: 1fr;
            }
            
            .custom-tab {
              padding: 10px;
              font-size: 12px;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default SuspectDetailOA;