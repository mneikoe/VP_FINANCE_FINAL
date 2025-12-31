import React, { useEffect, useReducer, useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { Modal, Button, Table } from "react-bootstrap";
import { Row, Col } from "react-bootstrap";

import {
  FiUser,
  FiPhone,
  FiMail,
  FiPlus,
  FiTrash2,
  FiDownload,
  FiUpload,
  FiActivity,
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import {
  FaBusinessTime,
  FaIdCardAlt,
  FaUsers,
  FaMoneyBillWave,
  FaTasks,
  FaBullseye,
  FaHistory,
  FaRegClock,
  FaRegCheckCircle,
  FaExclamationTriangle,
  FaUserCheck,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getProspectById } from "../../../redux/feature/ProspectRedux/ProspectThunx";
import TasksTab from "../TaskTab";

const ProspectDetail = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [userData, setUserData] = useState(null);
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
      try {
        const res = await dispatch(getProspectById(id)).unwrap();
        console.log("prospect Details fetched successfully", res);
        setUserData(res?.prospect);
      } catch (error) {
        console.error("Error fetching prospect details:", error);
      }
    };
    init();
  }, [id, dispatch]);

  const handleOpenModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType("");
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

  if (!userData) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="container customer-profile-container">
      {/* Header Section */}
      <div className="profile-header">
        <h1>Prospect Profile</h1>
        <div className="status-badge">
          <span className={`status-dot ${userData?.status || "N/A"}`}></span>
          {userData?.status || "N/A"}
        </div>
      </div>

      <div className="profile-grid">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-info">
            <h2 className="profile-name">
              {userData?.personalDetails?.name || "N/A"}
            </h2>
            <div className="profile-meta">
              <span className="badge text-bg-danger">
                {userData?.personalDetails?.groupCode || "N/A"}
              </span>
              <span className="badge secondary">
                {userData?.personalDetails?.grade || "N/A"}
              </span>
            </div>
            <div className="profile-details">
              <div className="detail-item">
                <FiUser className="detail-icon" />
                <div>
                  <p className="detail-label">Occupation</p>
                  <p className="detail-value">
                    {userData?.personalDetails?.organisation || "N/A"}
                  </p>
                </div>
              </div>
              <div className="detail-item">
                <FiPhone className="detail-icon" />
                <div>
                  <p className="detail-label">Phone</p>
                  <p className="detail-value">
                    {userData?.personalDetails?.mobileNo || "N/A"}
                  </p>
                </div>
              </div>
              <div className="detail-item">
                <FiMail className="detail-icon" />
                <div>
                  <p className="detail-label">Email</p>
                  <p className="detail-value">
                    {userData?.personalDetails?.emailId || "N/A"}
                  </p>
                </div>
              </div>
            </div>
            <div className="profile-stats">
              <div className="stat-item">
                <p className="stat-value">
                  {userData?.familyMembers?.length || 0}
                </p>
                <p className="stat-label">Family Members</p>
              </div>
              <div className="stat-item">
                <p className="stat-value">
                  {userData?.financialInfo?.insurance?.length || 0}
                </p>
                <p className="stat-label">Policies</p>
              </div>
              <div className="stat-item">
                <p className="stat-value">
                  {userData?.taskHistory?.length || 0}
                </p>
                <p className="stat-label">Tasks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="content-area">
          {/* Quick Info Cards */}
          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon">
                <FiUser size={24} />
              </div>
              <div>
                <h3>Member Since</h3>
                <p>{formatDate(userData.createdAt)}</p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <FiPhone size={24} />
              </div>
              <div>
                <h3>Last Contact</h3>
                <p>
                  {userData?.callTasks?.length > 0
                    ? formatDate(
                        userData.callTasks[userData.callTasks.length - 1]
                          ?.taskDate
                      )
                    : "No calls"}
                </p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <FaIdCardAlt size={24} />
              </div>
              <div>
                <h3>Referred By</h3>
                <p>{userData?.personalDetails?.leadPerson || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="tabs-container">
            <Tabs
              selectedIndex={tabIndex}
              onSelect={(index) => setTabIndex(index)}
            >
              <TabList className="custom-tablist">
                <Tab className={`custom-tab ${tabIndex === 0 ? "active" : ""}`}>
                  <FiUser className="tab-icon" />
                  <span>Personal Details</span>
                </Tab>
                <Tab className={`custom-tab ${tabIndex === 1 ? "active" : ""}`}>
                  <FaUsers className="tab-icon" />
                  <span>Family Members</span>
                </Tab>
                <Tab className={`custom-tab ${tabIndex === 2 ? "active" : ""}`}>
                  <FaMoneyBillWave className="tab-icon" />
                  <span>Financial Details</span>
                </Tab>
                <Tab className={`custom-tab ${tabIndex === 3 ? "active" : ""}`}>
                  <FaBullseye className="tab-icon" />
                  <span>Future Priorities</span>
                </Tab>
                <Tab className={`custom-tab ${tabIndex === 4 ? "active" : ""}`}>
                  <FaBullseye className="tab-icon" />
                  <span>Proposed Plans</span>
                </Tab>
                <Tab className={`custom-tab ${tabIndex === 5 ? "active" : ""}`}>
                  <FaIdCardAlt className="tab-icon" />
                  <span>KYC</span>
                </Tab>
                <Tab className={`custom-tab ${tabIndex === 6 ? "active" : ""}`}>
                  <FaHistory className="tab-icon" />
                  <span>Task History</span>
                </Tab>
                <Tab className={`custom-tab ${tabIndex === 7 ? "active" : ""}`}>
                  <FaTasks className="tab-icon" />
                  <span>Tasks</span>
                </Tab>
              </TabList>

              {/* Personal Details Tab */}
              <TabPanel>
                <div className="profile-details-container p-4">
                  <div className="row g-4">
                    <div className="col-md-12">
                      <div className="card shadow-sm h-100">
                        <div className="card-body">
                          <h5 className="card-title text-[#3498db] mb-4 border-bottom pb-2">
                            <FiUser className="me-2" />
                            Basic Information
                          </h5>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="detail-item d-flex align-items-center mb-3">
                                <span className="text-muted me-2">
                                  Group Code:
                                </span>
                                <span className="fw-semibold">
                                  {userData?.personalDetails?.groupCode ||
                                    "N/A"}
                                </span>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="detail-item d-flex align-items-center mb-3">
                                <span className="text-muted me-2">
                                  Group Head:
                                </span>
                                <span className="fw-semibold">
                                  {userData?.personalDetails?.familyHead ||
                                    "N/A"}
                                </span>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="detail-item d-flex align-items-center mb-3">
                                <span className="text-muted me-2">
                                  WhatsApp:
                                </span>
                                <span className="fw-semibold">
                                  {userData?.personalDetails?.whatsappNo ||
                                    "N/A"}
                                </span>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="detail-item d-flex align-items-center mb-3">
                                <span className="text-muted me-2">
                                  PA Name:
                                </span>
                                <span className="fw-semibold">
                                  {userData?.personalDetails?.paName || "N/A"}
                                </span>
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
                      {userData.familyMembers
                        .filter(
                          (member) => member?.relation?.toLowerCase() !== "self"
                        )
                        .map((member, index) => (
                          <div className="family-card" key={`member-${index}`}>
                            <div className="family-avatar">
                              {member?.name?.charAt(0) || "N"}
                            </div>
                            <div className="family-info">
                              <h3 className="mb-2 fw-semibold">
                                {member?.name || "N/A"}
                              </h3>
                              <p>
                                <strong>Relation:</strong>{" "}
                                {member?.relation || "N/A"}
                              </p>
                              <p>
                                <strong>Age:</strong>{" "}
                                {member?.dobActual
                                  ? `${calculateAge(member.dobActual)} years`
                                  : "N/A"}
                              </p>
                              <p>
                                <strong>Annual Income:</strong>{" "}
                                {member?.annualIncome || "N/A"}
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
                      <p className="text-muted">No Family Members</p>
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
                        style={{ background: "darkblue" }}
                        onClick={() => handleOpenModal("insurance")}
                      >
                        <h4>Total Insurance</h4>
                        <p className="meta">
                          Total{" "}
                          {userData?.financialInfo?.insurance?.length || 0}{" "}
                          policies
                        </p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div
                        className="financial-card"
                        style={{ background: "green" }}
                        onClick={() => handleOpenModal("investment")}
                      >
                        <h4>Total Investment</h4>
                        <p className="meta">
                          Total{" "}
                          {userData?.financialInfo?.investments?.length || 0}{" "}
                          Investments
                        </p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div
                        className="financial-card"
                        style={{ background: "darkred" }}
                        onClick={() => handleOpenModal("loan")}
                      >
                        <h4>Loan & Liabilities</h4>
                        <p className="meta">
                          Total {userData?.financialInfo?.loans?.length || 0}{" "}
                          Loan & Liabilities
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
                      {userData.futurePriorities.map((priority, index) => (
                        <div
                          key={priority._id || index}
                          className="col-md-6 col-lg-4 mb-4"
                        >
                          <div className="card h-100 shadow-sm">
                            <div className="card-header badge bg-info text-dark">
                              <h6 className="mb-0">
                                {priority.priorityName || "Unnamed Priority"}
                              </h6>
                            </div>
                            <div className="card-body">
                              <div className="mb-3">
                                <strong>Amount:</strong>
                                <div className="text-success fs-5">
                                  {formatCurrency(priority.approxAmount)}
                                </div>
                              </div>
                              <div className="mb-3">
                                <strong>Duration:</strong>
                                <div>
                                  {priority.duration || "Not specified"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="alert alert-info">
                        <p className="mb-0 text-muted">
                          No future priorities added yet.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabPanel>

              {/* Proposed Plans Tab */}
              <TabPanel>
                <div className="tab-content p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold mb-0">Proposed Financial Plans</h3>
                    <span className="badge bg-info text-dark fs-6 px-3 py-2">
                      {userData?.proposedPlan?.length || 0} Plans
                    </span>
                  </div>
                  {userData?.proposedPlan?.length > 0 ? (
                    <div className="row">
                      {userData.proposedPlan.map((plan, index) => (
                        <div className="col-lg-6 col-xl-4 mb-4" key={index}>
                          <div className="card h-100 shadow-sm border-0">
                            <div className="card-header badge bg-info text-dark">
                              <h6 className="mb-0 fw-bold">Plan {index + 1}</h6>
                            </div>
                            <div className="card-body">
                              <div className="mb-3">
                                <small className="text-muted fw-medium">
                                  Created On
                                </small>
                                <div className="fw-bold text-dark">
                                  {formatDate(plan?.createdDate)}
                                </div>
                              </div>
                              <div className="mb-3">
                                <small className="text-muted fw-medium">
                                  Member Name
                                </small>
                                <div className="fw-bold text-dark">
                                  {plan?.memberName || "N/A"}
                                </div>
                              </div>
                              <div className="mb-3">
                                <small className="text-muted fw-medium">
                                  Financial Product
                                </small>
                                <div className="fw-bold text-dark">
                                  {plan?.financialProduct || "N/A"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <div
                        className="alert alert-info mx-auto"
                        style={{ maxWidth: "400px" }}
                      >
                        <h5 className="alert-heading mb-2">
                          No Plans Available
                        </h5>
                        <p className="mb-0">
                          No Proposed Financial Plans have been added yet.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabPanel>

              {/* KYC Tab */}
              <TabPanel>
                <div className="tab-content p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold mb-0">
                      <FaIdCardAlt className="me-2" />
                      KYC Documents
                    </h3>
                    <span className="badge bg-info text-dark fs-6 px-3 py-2">
                      {userData?.kycs?.length || 0} Documents
                    </span>
                  </div>
                  {userData?.kycs?.length > 0 ? (
                    <div className="row">
                      {userData.kycs.map((kyc, index) => (
                        <div className="col-lg-6 col-xl-4 mb-4" key={index}>
                          <div className="card h-100 shadow-sm border-0">
                            <div className="card-header bg-light border-0 py-3">
                              <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0 fw-bold">
                                  KYC Document #{index + 1}
                                </h6>
                                <span
                                  className={`badge ${
                                    kyc.status === "verified"
                                      ? "bg-success"
                                      : "bg-warning"
                                  }`}
                                >
                                  {kyc.status || "pending"}
                                </span>
                              </div>
                            </div>
                            <div className="card-body">
                              <div className="mb-3">
                                <small className="text-muted fw-medium">
                                  Name
                                </small>
                                <div className="fw-bold text-dark">
                                  {kyc.name || "N/A"}
                                </div>
                              </div>
                              <div className="mb-3">
                                <small className="text-muted fw-medium">
                                  Created At
                                </small>
                                <div className="fw-bold text-dark">
                                  {formatDate(kyc.createdAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <div
                        className="alert alert-info border-0 shadow-sm mx-auto"
                        style={{ maxWidth: "400px" }}
                      >
                        <h5 className="alert-heading mb-2">No KYC Documents</h5>
                        <p className="mb-0">
                          No KYC documents have been uploaded yet.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabPanel>

              {/* ✅ Task History Tab - Fixed */}
              <TabPanel>
                <div className="tab-content p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold mb-0">
                      <FaHistory className="me-2" />
                      Task History
                    </h3>
                    <span className="badge bg-info text-dark fs-6 px-3 py-2">
                      {userData?.taskHistory?.length || 0} Tasks
                    </span>
                  </div>

                  {userData?.taskHistory?.length > 0 ? (
                    <>
                      {/* Summary Cards */}
                      <div className="row mb-4">
                        <div className="col-md-3 mb-3">
                          <div className="card border-0 shadow-sm bg-primary bg-opacity-10">
                            <div className="card-body text-center">
                              <FaRegClock className="text-primary fs-3 mb-2" />
                              <h4 className="text-primary">
                                {
                                  userData.taskHistory.filter(
                                    (t) => t.currentStatus === "in-progress"
                                  ).length
                                }
                              </h4>
                              <p className="text-muted small mb-0">
                                In Progress
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3 mb-3">
                          <div className="card border-0 shadow-sm bg-success bg-opacity-10">
                            <div className="card-body text-center">
                              <FaRegCheckCircle className="text-success fs-3 mb-2" />
                              <h4 className="text-success">
                                {
                                  userData.taskHistory.filter(
                                    (t) => t.currentStatus === "completed"
                                  ).length
                                }
                              </h4>
                              <p className="text-muted small mb-0">Completed</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3 mb-3">
                          <div className="card border-0 shadow-sm bg-warning bg-opacity-10">
                            <div className="card-body text-center">
                              <FaExclamationTriangle className="text-warning fs-3 mb-2" />
                              <h4 className="text-warning">
                                {
                                  userData.taskHistory.filter(
                                    (t) => t.currentStatus === "pending"
                                  ).length
                                }
                              </h4>
                              <p className="text-muted small mb-0">Pending</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3 mb-3">
                          <div className="card border-0 shadow-sm bg-secondary bg-opacity-10">
                            <div className="card-body text-center">
                              <FaHistory className="text-secondary fs-3 mb-2" />
                              <h4 className="text-secondary">
                                {userData.taskHistory.length}
                              </h4>
                              <p className="text-muted small mb-0">
                                Total Tasks
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Task List */}
                      <div className="card border-0 shadow-sm">
                        <div className="card-body">
                          <div className="task-list">
                            {userData.taskHistory.map((task, index) => (
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
                                      <span
                                        className={`badge ${getTaskTypeBadgeClass(
                                          task.taskType
                                        )}`}
                                      >
                                        {task.taskType || "Task"}
                                      </span>
                                      <span
                                        className={`badge ${getStatusBadgeClass(
                                          task.currentStatus
                                        )}`}
                                      >
                                        {task.currentStatus || "pending"}
                                      </span>
                                      <span
                                        className={`badge ${getPriorityBadgeClass(
                                          task.priority
                                        )}`}
                                      >
                                        {task.priority || "medium"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-end">
                                    <small className="text-muted d-block">
                                      <FiCalendar className="me-1" />
                                      {formatDate(task.createdAt)}
                                    </small>
                                    {task.dueDate && (
                                      <small className="text-muted d-block">
                                        Due: {formatDate(task.dueDate)}
                                      </small>
                                    )}
                                  </div>
                                </div>

                                <div className="row">
                                  <div className="col-md-6">
                                    <div className="mb-3">
                                      <small className="text-muted d-block">
                                        Assigned To
                                      </small>
                                      <div className="d-flex align-items-center">
                                        <FaUserCheck className="me-2 text-primary" />
                                        <span className="fw-semibold">
                                          {task.assignedToName ||
                                            task.assignedTo?._id ||
                                            "Unassigned"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="mb-3">
                                      <small className="text-muted d-block">
                                        Assigned At
                                      </small>
                                      <div className="fw-semibold">
                                        {formatDate(task.assignedAt)}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Status Updates */}
                                {task.statusUpdates?.length > 0 && (
                                  <div className="mt-3">
                                    <small className="text-muted d-block mb-2">
                                      Status Updates
                                    </small>
                                    <div className="status-updates-container">
                                      {task.statusUpdates.map(
                                        (update, updateIndex) => (
                                          <div
                                            key={updateIndex}
                                            className="status-update-item mb-2 p-2 bg-light rounded"
                                          >
                                            <div className="d-flex align-items-center">
                                              <div
                                                className={`status-indicator ${update.status}`}
                                              ></div>
                                              <div className="ms-2">
                                                <div className="d-flex justify-content-between">
                                                  <span className="fw-semibold">
                                                    {update.status}
                                                  </span>
                                                  <small className="text-muted">
                                                    {formatDate(
                                                      update.updatedAt
                                                    )}
                                                  </small>
                                                </div>
                                                {update.remarks && (
                                                  <small className="text-muted d-block">
                                                    {update.remarks}
                                                  </small>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
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
                      <div
                        className="alert alert-info border-0 shadow-sm mx-auto"
                        style={{ maxWidth: "400px" }}
                      >
                        <h5 className="alert-heading mb-2">No Task History</h5>
                        <p className="mb-0">
                          No task history available for this prospect.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabPanel>

              {/* Tasks Tab */}
              <TabPanel>
                <TasksTab />
              </TabPanel>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Financial Modals */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "insurance" && "Insurance Policies"}
            {modalType === "investment" && "Investments"}
            {modalType === "loan" && "Loans & Liabilities"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{/* Modal content here */}</Modal.Body>
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
          background: #28a745;
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
        }
        .badge {
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
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
        .financial-card {
          padding: 15px;
          border-radius: 8px;
          color: white;
          cursor: pointer;
        }
        .financial-card:hover {
          opacity: 0.9;
        }
        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 8px;
        }
        .status-indicator.completed {
          background-color: #28a745;
        }
        .status-indicator.in-progress {
          background-color: #17a2b8;
        }
        .status-indicator.pending {
          background-color: #ffc107;
        }
      `}</style>
    </div>
  );
};

export default ProspectDetail;
