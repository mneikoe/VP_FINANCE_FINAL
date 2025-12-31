import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Badge,
  Button,
  ListGroup,
  ProgressBar,
  Modal,
  Form,
  Tab,
  Tabs,
  Alert,
  Spinner,
  Container,
  Table,
  Tooltip,
} from "react-bootstrap";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaUserTie,
  FaBuilding,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaPaperclip,
  FaEnvelope,
  FaListAlt,
  FaUserFriends,
  FaUsers,
  FaStickyNote,
  FaCheck,
  FaTimes,
  FaDownload,
  FaEye,
  FaHistory,
  FaMobileAlt,
  FaExternalLinkAlt,
  FaEdit,
  FaFileUpload,
  FaInfoCircle,
  FaSync,
  FaUserEdit,
  FaPhone,
  FaMapMarkerAlt,
  FaIdCard,
  FaBriefcase,
  FaSms,
  FaWhatsapp,
} from "react-icons/fa";
import { format, parseISO } from "date-fns";

const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [checklistStatus, setChecklistStatus] = useState({});
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showProspectModal, setShowProspectModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [entityType, setEntityType] = useState("");
  const [entityStatus, setEntityStatus] = useState("pending");
  const [entityRemarks, setEntityRemarks] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [entityStatuses, setEntityStatuses] = useState({});
  const [entityHistory, setEntityHistory] = useState([]);
  const [entityFullHistory, setEntityFullHistory] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeId = currentUser?.id;
  const employeeName = currentUser?.username || "Employee";

  // Status options
  const statusOptions = [
    { value: "pending", label: "Pending", color: "secondary" },
    { value: "in-progress", label: "In Progress", color: "info" },
    { value: "completed", label: "Completed", color: "success" },
    { value: "cancelled", label: "Cancelled", color: "danger" },
  ];

  // Status configuration
  const statusConfig = {
    pending: { bg: "#6c757d", text: "PENDING", color: "white", icon: FaClock },
    "in-progress": {
      bg: "#0dcaf0",
      text: "IN PROGRESS",
      color: "white",
      icon: FaSync,
    },
    completed: {
      bg: "#198754",
      text: "COMPLETED",
      color: "white",
      icon: FaCheckCircle,
    },
    cancelled: {
      bg: "#dc3545",
      text: "CANCELLED",
      color: "white",
      icon: FaTimes,
    },
  };

  // Fetch task details
  useEffect(() => {
    fetchTaskDetails();
    fetchEntityStatuses();
  }, [taskId, refreshKey]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/Task/${taskId}?type=individual`);

      if (response.data.success) {
        let taskData = response.data.task;

        // If client/prospect details are missing, fetch from assigned tasks
        if (
          (!taskData.assignedClients ||
            taskData.assignedClients.length === 0) &&
          (!taskData.assignedProspects ||
            taskData.assignedProspects.length === 0)
        ) {
          // Try to get from employee's assigned tasks
          if (employeeId) {
            try {
              const tasksResponse = await axios.get(
                `/api/Task/assigned/${employeeId}`
              );
              if (tasksResponse.data.success) {
                const allTasks = tasksResponse.data.data?.tasks || [];
                // Find current task in the list
                const currentTask = allTasks.find(
                  (t) => t.id === taskId || t._id === taskId
                );

                if (currentTask) {
                  // Merge the data
                  taskData = {
                    ...taskData,
                    assignedClients: currentTask.assignedClients || [],
                    assignedProspects: currentTask.assignedProspects || [],
                  };
                }
              }
            } catch (error) {
              console.error("Error fetching assigned tasks:", error);
            }
          }
        }

        setTask(taskData);

        // Load checklist status from localStorage
        const checklistStatus = {};
        taskData.checklists?.forEach((_, index) => {
          const key = `checklist_${taskData._id}_${index}`;
          checklistStatus[index] = localStorage.getItem(key) === "completed";
        });
        setChecklistStatus(checklistStatus);
      }
    } catch (error) {
      console.error("Error fetching task details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntityStatuses = async () => {
    try {
      // Fetch entity statuses from backend
      const response = await axios.get(`/api/Task/entity-status/${taskId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        setEntityStatuses(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching entity statuses:", error);
    }
  };

  const fetchEntityHistory = async (entityId) => {
    try {
      const response = await axios.get(
        `/api/Task/entity/${entityId}/task-history`,
        {
          params: {
            taskId: taskId,
            limit: 100,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setEntityHistory(response.data.data.taskHistory || []);
      }
    } catch (error) {
      console.error("Error fetching entity history:", error);
      setEntityHistory([]);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "Not set";
    try {
      if (date instanceof Date) {
        return format(date, "dd MMM yyyy, hh:mm a");
      }
      if (typeof date === "string") {
        return format(parseISO(date), "dd MMM yyyy, hh:mm a");
      }
      return "Invalid date";
    } catch {
      return "Invalid date";
    }
  };

  // Calculate days left
  const calculateDaysLeft = (dueDate) => {
    if (!dueDate) return null;
    try {
      const due = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      due.setHours(0, 0, 0, 0);
      const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      return diff;
    } catch {
      return null;
    }
  };

  // Open status modal
  const openStatusModal = (entity, type) => {
    setSelectedEntity(entity);
    setEntityType(type);

    // Check if entity has existing status
    const entityId = entity._id || entity.id;
    const existingStatus =
      entityStatuses[entityId] || entityStatuses[entityId?.toString()];

    if (existingStatus) {
      setEntityStatus(existingStatus.status || "pending");
      setEntityRemarks(existingStatus.remarks || "");
    } else {
      setEntityStatus("pending");
      setEntityRemarks("");
    }

    setShowStatusModal(true);
  };

  // Open history modal
  const openHistoryModal = async (entity) => {
    setSelectedEntity(entity);
    await fetchEntityHistory(entity._id || entity.id);
    setShowHistoryModal(true);
  };

  // Save status
  const saveStatus = async () => {
    if (!selectedEntity || !entityStatus.trim()) {
      alert("Please select a status");
      return;
    }

    try {
      const entityId = selectedEntity._id || selectedEntity.id;
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const employeeId = currentUser?.id;
      const employeeName = currentUser?.username || "Employee";

      if (!employeeId) {
        alert("User not found. Please login again.");
        return;
      }

      const response = await axios.put(
        `/api/Task/entity/${entityId}/task/${taskId}/status`,
        {
          status: entityStatus,
          remarks: entityRemarks,
          employeeId: employeeId,
          employeeName: employeeName,
          files: selectedFiles.map((file) => ({
            filename: file.name,
            originalName: file.name,
          })),
        }
      );

      if (response.data.success) {
        alert("Status updated successfully!");
        setShowStatusModal(false);
        setRefreshKey((prev) => prev + 1);
        setSelectedFiles([]);
        setEntityRemarks("");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      if (error.response) {
        const errorMsg =
          error.response.data?.message ||
          error.response.data?.error ||
          "Failed to update status";
        alert(`Error: ${errorMsg}`);

        if (error.response.status === 400 && errorMsg.includes("Employee ID")) {
          alert("Please login again. Your session might have expired.");
          localStorage.removeItem("user");
          navigate("/login");
        }
      } else if (error.request) {
        alert("Network error. Please check your connection.");
      } else {
        alert("An unexpected error occurred.");
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  // Handle checklist toggle
  const handleChecklistToggle = async (index) => {
    const newStatus = !checklistStatus[index];
    const updatedStatus = { ...checklistStatus, [index]: newStatus };
    setChecklistStatus(updatedStatus);

    const key = `checklist_${task._id}_${index}`;
    localStorage.setItem(key, newStatus ? "completed" : "pending");
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!task) return 0;

    const checklistProgress =
      Object.values(checklistStatus).filter(Boolean).length;
    const totalChecklists = task.checklists?.length || 0;

    let completedEntities = 0;
    const allEntities = [
      ...(task.assignedClients || []),
      ...(task.assignedProspects || []),
    ];

    allEntities.forEach((entity) => {
      const entityId = entity._id || entity.id;
      const status =
        entityStatuses[entityId] || entityStatuses[entityId?.toString()];
      if (status?.status === "completed") {
        completedEntities++;
      }
    });

    const totalEntities = allEntities.length;
    const totalItems = totalChecklists + totalEntities;
    const completedItems = checklistProgress + completedEntities;

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  // Get entity status badge
  const getEntityStatusBadge = (entity) => {
    const entityId = entity._id || entity.id;
    const statusData =
      entityStatuses[entityId] || entityStatuses[entityId?.toString()];
    const status = statusData?.status || "pending";
    const config = statusConfig[status] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
      <Badge
        bg={config.bg}
        className="px-3 py-1 d-flex align-items-center gap-1"
      >
        <StatusIcon size={12} />
        <span>{config.text}</span>
      </Badge>
    );
  };

  // Get status color
  const getStatusColor = (status) => {
    return statusConfig[status]?.bg || "#6c757d";
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading task details...</p>
        </div>
      </Container>
    );
  }

  if (!task) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <h4>Task not found</h4>
          <p>
            The requested task does not exist or you don't have access to it.
          </p>
          <Button variant="primary" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" />
            Go Back
          </Button>
        </Alert>
      </Container>
    );
  }

  const overallProgress = calculateOverallProgress();
  const daysLeft = calculateDaysLeft(task.assignmentDetails?.dueDate);

  return (
    <Container fluid className="py-4 relative bottom-10">
      {/* Header */}
      <div className="mb-4">
        <Button variant="light" onClick={() => navigate(-1)} className="mb-3">
          <FaArrowLeft className="me-2" />
          Back to Tasks
        </Button>

        <Row className="mb-4">
          <Col lg={8}>
            <div>
              <h2 className="fw-bold mb-2">{task.name}</h2>
              <div className="d-flex gap-2 mb-3 flex-wrap">
                <Badge bg="secondary" className="px-3 py-2">
                  {task.type?.toUpperCase() || "TASK"}
                </Badge>
                <Badge bg="info" className="px-3 py-2">
                  <FaSync className="me-1" />
                  Progress: {overallProgress}%
                </Badge>
                {daysLeft !== null && (
                  <Badge
                    bg={
                      daysLeft < 0
                        ? "danger"
                        : daysLeft <= 2
                        ? "warning"
                        : "success"
                    }
                    className="px-3 py-2"
                  >
                    <FaCalendarAlt className="me-1" />
                    {daysLeft < 0
                      ? `${Math.abs(daysLeft)} days overdue`
                      : `${daysLeft} days left`}
                  </Badge>
                )}
              </div>
            </div>
          </Col>
        </Row>

        {/* Task Summary and Assignment Details Cards */}
        <Row className="mb-4">
          <Col lg={6}>
            <Card className="h-100">
              <Card.Header className="bg-light">
                <h5 className="fw-bold mb-0">
                  <FaBuilding className="me-2" />
                  Task Summary
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col sm={6}>
                    <div className="mb-3">
                      <small className="text-muted d-block">Company</small>
                      <strong>{task.company || task.sub || "N/A"}</strong>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">Product</small>
                      <strong>{task.product || task.cat?.name || "N/A"}</strong>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">Checklists</small>
                      <strong>
                        {Object.values(checklistStatus).filter(Boolean).length}/
                        {task.checklists?.length || 0}
                      </strong>
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div className="mb-3">
                      <small className="text-muted d-block">Department</small>
                      <strong>
                        {Array.isArray(task.depart)
                          ? task.depart.join(", ")
                          : task.depart}
                      </strong>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">Clients</small>
                      <strong>{task.assignedClients?.length || 0}</strong>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">Prospects</small>
                      <strong>{task.assignedProspects?.length || 0}</strong>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6}>
            <Card className="h-100">
              <Card.Header className="bg-light">
                <h5 className="fw-bold mb-0">
                  <FaUserTie className="me-2" />
                  Assignment Details
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col sm={6}>
                    <div className="mb-3">
                      <small className="text-muted d-block">Assigned To</small>
                      <strong>{employeeName}</strong>
                    </div>
                    {task.assignmentDetails?.assignedBy && (
                      <div className="mb-3">
                        <small className="text-muted d-block">
                          Assigned By
                        </small>
                        <strong>
                          {task.assignmentDetails.assignedBy.name}
                        </strong>
                      </div>
                    )}
                  </Col>
                  <Col sm={6}>
                    <div className="mb-3">
                      <small className="text-muted d-block">Due Date</small>
                      <strong
                        className={
                          daysLeft !== null && daysLeft < 0 ? "text-danger" : ""
                        }
                      >
                        {formatDate(task.assignmentDetails?.dueDate)}
                      </strong>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">Days Left</small>
                      <strong
                        className={
                          daysLeft !== null && daysLeft < 0
                            ? "text-danger"
                            : "text-success"
                        }
                      >
                        {daysLeft !== null
                          ? daysLeft < 0
                            ? `${Math.abs(daysLeft)} days overdue`
                            : `${daysLeft} days left`
                          : "N/A"}
                      </strong>
                    </div>
                  </Col>
                </Row>
                {task.assignmentDetails?.remarks && (
                  <div className="mt-3 pt-3 border-top">
                    <small className="text-muted d-block">Remarks</small>
                    <p className="mb-0">{task.assignmentDetails.remarks}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Main Content */}
      <Card>
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="overview" title="Overview">
              <div className="mt-3">
                {/* Description */}
                <div className="mb-4">
                  <h5 className="fw-bold mb-3">
                    <FaFileAlt className="me-2" />
                    Task Description
                  </h5>
                  <div className="bg-light p-3 rounded">
                    {task.descp?.text || "No description provided."}
                  </div>
                  {task.descp?.image && (
                    <div className="mt-3">
                      <img
                        src={`/uploads/${task.descp.image}`}
                        alt="Task"
                        className="img-fluid rounded"
                        style={{ maxHeight: "300px" }}
                      />
                    </div>
                  )}
                </div>

                {/* Checklists */}
                {task.checklists && task.checklists.length > 0 && (
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="fw-bold mb-0">
                        <FaListAlt className="me-2" />
                        Checklists (
                        {Object.values(checklistStatus).filter(Boolean).length}/
                        {task.checklists.length})
                      </h5>
                      <ProgressBar
                        now={
                          (Object.values(checklistStatus).filter(Boolean)
                            .length /
                            task.checklists.length) *
                          100
                        }
                        label={`${Math.round(
                          (Object.values(checklistStatus).filter(Boolean)
                            .length /
                            task.checklists.length) *
                            100
                        )}%`}
                        style={{ width: "200px", height: "10px" }}
                      />
                    </div>
                    <ListGroup>
                      {task.checklists.map((item, index) => (
                        <ListGroup.Item key={index}>
                          <div className="d-flex align-items-center">
                            <Form.Check
                              type="checkbox"
                              checked={checklistStatus[index] || false}
                              onChange={() => handleChecklistToggle(index)}
                              className="me-3"
                              id={`checklist-${index}`}
                            />
                            <label
                              htmlFor={`checklist-${index}`}
                              className={`mb-0 ${
                                checklistStatus[index]
                                  ? "text-decoration-line-through text-muted"
                                  : ""
                              }`}
                              style={{ cursor: "pointer", flex: 1 }}
                            >
                              {item}
                            </label>
                            <Badge
                              bg={checklistStatus[index] ? "success" : "light"}
                              text={checklistStatus[index] ? "white" : "dark"}
                            >
                              {checklistStatus[index] ? "Completed" : "Pending"}
                            </Badge>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}

                {/* Forms */}
                {task.formChecklists && task.formChecklists.length > 0 && (
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">
                      <FaPaperclip className="me-2" />
                      Required Forms
                    </h5>
                    <Row>
                      {task.formChecklists.map((form, index) => (
                        <Col md={6} key={index}>
                          <Card className="mb-3">
                            <Card.Body>
                              <h6>{form.name}</h6>
                              <div className="d-flex gap-2 mt-2">
                                {form.downloadFormUrl && (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    href={`/uploads/${form.downloadFormUrl}`}
                                    target="_blank"
                                  >
                                    <FaDownload className="me-1" />
                                    Download
                                  </Button>
                                )}
                                {form.sampleFormUrl && (
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    href={`/uploads/${form.sampleFormUrl}`}
                                    target="_blank"
                                  >
                                    <FaEye className="me-1" />
                                    Sample
                                  </Button>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}

                {/* Communication Templates */}
                <div className="mb-4">
                  <h5 className="fw-bold mb-3">
                    <FaEnvelope className="me-2" />
                    Communication Templates
                  </h5>
                  <Tabs defaultActiveKey="email" className="mb-3">
                    <Tab eventKey="email" title="Email">
                      <div className="bg-light p-3 rounded">
                        <pre
                          className="mb-0"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {task.email_descp || "No email template provided."}
                        </pre>
                      </div>
                    </Tab>
                    <Tab eventKey="sms" title="SMS">
                      <div className="bg-light p-3 rounded">
                        <pre
                          className="mb-0"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {task.sms_descp || "No SMS template provided."}
                        </pre>
                      </div>
                    </Tab>
                    <Tab eventKey="whatsapp" title="WhatsApp">
                      <div className="bg-light p-3 rounded">
                        <pre
                          className="mb-0"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {task.whatsapp_descp ||
                            "No WhatsApp template provided."}
                        </pre>
                      </div>
                    </Tab>
                  </Tabs>
                </div>
              </div>
            </Tab>

            <Tab eventKey="clients" title="Clients & Prospects">
              <div className="mt-3">
                {/* Clients Table */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">
                      <FaUserFriends className="me-2" />
                      Assigned Clients ({task.assignedClients?.length || 0})
                    </h5>
                  </div>

                  {task.assignedClients?.length > 0 ? (
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Group Code</th>
                            <th>Group Name</th>
                            <th>Mobile</th>
                            <th>Email</th>
                            <th>Task Status</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {task.assignedClients.map((client, index) => {
                            const entityId = client._id || client.id;
                            const statusData =
                              entityStatuses[entityId] ||
                              entityStatuses[entityId?.toString()];

                            return (
                              <tr key={index}>
                                <td className="align-middle">
                                  {client.personalDetails?.groupCode ? (
                                    <Badge
                                      bg="light"
                                      text="dark"
                                      className="border"
                                    >
                                      {client.personalDetails.groupCode}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted">N/A</span>
                                  )}
                                </td>
                                <td className="align-middle">
                                  <div className="d-flex align-items-center">
                                    <FaUserFriends
                                      className="text-success me-2"
                                      size={16}
                                    />
                                    <div>
                                      <div className="fw-semibold">
                                        {client.personalDetails?.groupName ||
                                          "Unnamed Client"}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="align-middle">
                                  <div className="d-flex align-items-center">
                                    <FaMobileAlt
                                      className="text-muted me-2"
                                      size={14}
                                    />
                                    <span className="text-nowrap">
                                      {client.personalDetails?.mobileNo ||
                                        "N/A"}
                                    </span>
                                  </div>
                                </td>
                                <td className="align-middle">
                                  <div className="d-flex align-items-center">
                                    <FaEnvelope
                                      className="text-muted me-2"
                                      size={14}
                                    />
                                    {client.personalDetails?.emailId ? (
                                      <a
                                        href={`mailto:${client.personalDetails.emailId}`}
                                        className="text-decoration-none text-truncate d-inline-block"
                                        style={{ maxWidth: "200px" }}
                                        title={client.personalDetails.emailId}
                                      >
                                        {client.personalDetails.emailId}
                                      </a>
                                    ) : (
                                      <span className="text-muted">N/A</span>
                                    )}
                                  </div>
                                </td>
                                <td className="align-middle">
                                  {getEntityStatusBadge(client)}
                                </td>
                                <td className="align-middle">
                                  <div className="d-flex justify-content-center gap-2">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() =>
                                        openStatusModal(client, "client")
                                      }
                                      title="Update Status"
                                    >
                                      <FaEdit className="me-1" />
                                      Update
                                    </Button>
                                    <Button
                                      variant="outline-info"
                                      size="sm"
                                      onClick={() => openHistoryModal(client)}
                                      title="View History"
                                    >
                                      <FaHistory className="me-1" />
                                      History
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <Alert variant="info" className="border">
                      <div className="text-center py-4">
                        <FaUserFriends size={48} className="text-info mb-3" />
                        <h5 className="text-info mb-2">No clients assigned</h5>
                        <p className="text-muted mb-0">
                          This task is not assigned to any specific clients.
                        </p>
                      </div>
                    </Alert>
                  )}
                </div>

                {/* Prospects Table */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">
                      <FaUsers className="me-2" />
                      Assigned Prospects ({task.assignedProspects?.length || 0})
                    </h5>
                  </div>

                  {task.assignedProspects?.length > 0 ? (
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>#</th>
                            <th>Group Code</th>
                            <th>Group Name</th>
                            <th>Mobile</th>
                            <th>Email</th>
                            <th>Lead Source</th>
                            <th>Task Status</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {task.assignedProspects.map((prospect, index) => {
                            const entityId = prospect._id || prospect.id;
                            const statusData =
                              entityStatuses[entityId] ||
                              entityStatuses[entityId?.toString()];

                            return (
                              <tr key={index}>
                                <td className="align-middle">
                                  <div className="text-center">
                                    <span className="fw-bold">{index + 1}</span>
                                  </div>
                                </td>
                                <td className="align-middle">
                                  {prospect.personalDetails?.groupCode ? (
                                    <Badge
                                      bg="light"
                                      text="dark"
                                      className="border"
                                    >
                                      {prospect.personalDetails.groupCode}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted">N/A</span>
                                  )}
                                </td>
                                <td className="align-middle">
                                  <div className="d-flex align-items-center">
                                    <FaUsers
                                      className="text-info me-2"
                                      size={16}
                                    />
                                    <div>
                                      <div className="fw-semibold">
                                        {prospect.personalDetails?.name ||
                                          "Unnamed Prospect"}
                                      </div>
                                      <small className="text-muted">
                                        {prospect.personalDetails?.groupName ||
                                          ""}
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td className="align-middle">
                                  <div className="d-flex align-items-center">
                                    <FaMobileAlt
                                      className="text-muted me-2"
                                      size={14}
                                    />
                                    <span className="text-nowrap">
                                      {prospect.personalDetails?.mobileNo ||
                                        "N/A"}
                                    </span>
                                  </div>
                                </td>
                                <td className="align-middle">
                                  <div className="d-flex align-items-center">
                                    <FaEnvelope
                                      className="text-muted me-2"
                                      size={14}
                                    />
                                    {prospect.personalDetails?.emailId ? (
                                      <a
                                        href={`mailto:${prospect.personalDetails.emailId}`}
                                        className="text-decoration-none text-truncate d-inline-block"
                                        style={{ maxWidth: "200px" }}
                                        title={prospect.personalDetails.emailId}
                                      >
                                        {prospect.personalDetails.emailId}
                                      </a>
                                    ) : (
                                      <span className="text-muted">N/A</span>
                                    )}
                                  </div>
                                </td>
                                <td className="align-middle">
                                  {prospect.personalDetails?.leadSource ? (
                                    <Badge
                                      bg="light"
                                      text="dark"
                                      className="border"
                                    >
                                      {prospect.personalDetails.leadSource}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted">N/A</span>
                                  )}
                                </td>
                                <td className="align-middle">
                                  {getEntityStatusBadge(prospect)}
                                </td>
                                <td className="align-middle">
                                  <div className="d-flex justify-content-center gap-2">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() =>
                                        openStatusModal(prospect, "prospect")
                                      }
                                      title="Update Status"
                                    >
                                      <FaEdit className="me-1" />
                                      Update
                                    </Button>
                                    <Button
                                      variant="outline-info"
                                      size="sm"
                                      onClick={() => openHistoryModal(prospect)}
                                      title="View History"
                                    >
                                      <FaHistory className="me-1" />
                                      History
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <Alert variant="info" className="border">
                      <div className="text-center py-4">
                        <FaUsers size={48} className="text-info mb-3" />
                        <h5 className="text-info mb-2">
                          No prospects assigned
                        </h5>
                        <p className="text-muted mb-0">
                          This task is not assigned to any specific prospects.
                        </p>
                      </div>
                    </Alert>
                  )}
                </div>

                {/* Assignment Remarks */}
                {(task.clientAssignmentRemarks ||
                  task.prospectAssignmentRemarks) && (
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">
                      <FaStickyNote className="me-2" />
                      Assignment Remarks
                    </h5>
                    <Card className="border">
                      <Card.Body>
                        <Row>
                          {task.clientAssignmentRemarks && (
                            <Col md={6}>
                              <div className="mb-3">
                                <h6 className="fw-bold mb-2">
                                  <FaUserFriends className="text-success me-2" />
                                  Client Assignment Remarks
                                </h6>
                                <div className="bg-light p-3 rounded">
                                  <p className="mb-0">
                                    {task.clientAssignmentRemarks}
                                  </p>
                                </div>
                              </div>
                            </Col>
                          )}

                          {task.prospectAssignmentRemarks && (
                            <Col md={6}>
                              <div className="mb-3">
                                <h6 className="fw-bold mb-2">
                                  <FaUsers className="text-warning me-2" />
                                  Prospect Assignment Remarks
                                </h6>
                                <div className="bg-light p-3 rounded">
                                  <p className="mb-0">
                                    {task.prospectAssignmentRemarks}
                                  </p>
                                </div>
                              </div>
                            </Col>
                          )}
                        </Row>
                      </Card.Body>
                    </Card>
                  </div>
                )}
              </div>
            </Tab>

            <Tab eventKey="files" title="Files & Attachments">
              <div className="mt-3">
                <h5 className="fw-bold mb-3">Upload Files</h5>
                <Card className="mb-4 border">
                  <Card.Body>
                    <Form>
                      <Form.Group>
                        <Form.Label>Upload Task Files</Form.Label>
                        <Form.Control
                          type="file"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            const newFiles = files.map((file) => ({
                              id: Date.now() + Math.random(),
                              name: file.name,
                              size: file.size,
                              type: file.type,
                              file,
                              uploadedAt: new Date(),
                            }));
                            setUploadedFiles([...uploadedFiles, ...newFiles]);
                          }}
                        />
                        <Form.Text className="text-muted">
                          Upload completed forms, documents, or screenshots.
                        </Form.Text>
                      </Form.Group>
                    </Form>
                  </Card.Body>
                </Card>

                {uploadedFiles.length > 0 && (
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">Uploaded Files</h6>
                    <ListGroup>
                      {uploadedFiles.map((file) => (
                        <ListGroup.Item key={file.id}>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{file.name}</strong>
                              <div className="text-muted small">
                                {formatDate(file.uploadedAt)} •{" "}
                                {(file.size / 1024).toFixed(2)} KB
                              </div>
                            </div>
                            <div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                              >
                                <FaEye />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => {
                                  setUploadedFiles(
                                    uploadedFiles.filter(
                                      (f) => f.id !== file.id
                                    )
                                  );
                                }}
                              >
                                <FaTimes />
                              </Button>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}
              </div>
            </Tab>

            <Tab eventKey="history" title="Activity History">
              <div className="mt-3">
                <h5 className="fw-bold mb-3">
                  <FaHistory className="me-2" />
                  Task Activity
                </h5>
                <ListGroup>
                  <ListGroup.Item>
                    <div className="d-flex justify-content-between">
                      <div>
                        <strong>Task Created</strong>
                      </div>
                      <div className="text-muted">
                        {formatDate(task.createdAt)}
                      </div>
                    </div>
                  </ListGroup.Item>

                  {task.assignmentDetails?.assignedAt && (
                    <ListGroup.Item>
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>Task Assigned</strong>
                        </div>
                        <div className="text-muted">
                          {formatDate(task.assignmentDetails.assignedAt)}
                        </div>
                      </div>
                    </ListGroup.Item>
                  )}

                  {task.assignmentDetails?.dueDate && (
                    <ListGroup.Item>
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>Due Date Set</strong>
                          <div className="text-muted small">
                            {daysLeft !== null && (
                              <span
                                className={
                                  daysLeft < 0 ? "text-danger" : "text-success"
                                }
                              >
                                {daysLeft < 0
                                  ? `${Math.abs(daysLeft)} days overdue`
                                  : `${daysLeft} days left`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-muted">
                          {formatDate(task.assignmentDetails.dueDate)}
                        </div>
                      </div>
                    </ListGroup.Item>
                  )}

                  {task.completedAt && (
                    <ListGroup.Item>
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>Task Completed</strong>
                        </div>
                        <div className="text-muted">
                          {formatDate(task.completedAt)}
                        </div>
                      </div>
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Modals */}
      {/* Status Update Modal */}
      <Modal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="fw-bold">
            <FaUserEdit className="me-2" />
            Update {entityType === "client" ? "Client" : "Prospect"} Status
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEntity && (
            <div className="mb-4">
              <h6 className="fw-bold mb-2">
                {entityType === "client" ? "Client" : "Prospect"} Details:
              </h6>
              <div className="bg-light p-3 rounded">
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-1">
                      <strong>Name:</strong>{" "}
                      {selectedEntity.personalDetails?.name}
                    </p>
                    <p className="mb-1">
                      <strong>Mobile:</strong>{" "}
                      {selectedEntity.personalDetails?.mobileNo || "N/A"}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1">
                      <strong>Email:</strong>{" "}
                      {selectedEntity.personalDetails?.emailId || "N/A"}
                    </p>
                    <p className="mb-0">
                      <strong>Type:</strong> {entityType.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Status *</strong>
              </Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      entityStatus === option.value
                        ? option.color
                        : `outline-${option.color}`
                    }
                    onClick={() => setEntityStatus(option.value)}
                    className="flex-grow-1"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Remarks</strong>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={entityRemarks}
                onChange={(e) => setEntityRemarks(e.target.value)}
                placeholder="Add remarks about this update..."
                className="border"
              />
              <Form.Text className="text-muted">
                Explain what was done or why the status is being changed.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Upload Documents (Optional)</strong>
              </Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleFileSelect}
                className="border"
              />
              <Form.Text className="text-muted">
                Upload supporting documents, screenshots, or completed forms.
              </Form.Text>
            </Form.Group>

            {selectedFiles.length > 0 && (
              <div className="mb-3">
                <strong>Selected Files:</strong>
                <ListGroup className="mt-2">
                  {selectedFiles.map((file, index) => (
                    <ListGroup.Item
                      key={index}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <span>{file.name}</span>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setSelectedFiles(
                            selectedFiles.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        <FaTimes />
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-top">
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveStatus}>
            <FaCheck className="me-1" />
            Save Status
          </Button>
        </Modal.Footer>
      </Modal>

      {/* History Modal */}
      <Modal
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        size="xl"
        centered
        scrollable
      >
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="fw-bold">
            <FaHistory className="me-2" />
            Task History for {selectedEntity?.personalDetails?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {entityHistory.length > 0 ? (
            <div className="timeline">
              {entityHistory.map((historyItem, index) => (
                <div key={index} className="mb-4">
                  <div className="d-flex">
                    <div className="flex-shrink-0 me-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "40px",
                          height: "40px",
                          backgroundColor: getStatusColor(
                            historyItem.currentStatus
                          ),
                          color: "white",
                        }}
                      >
                        <FaHistory size={18} />
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between text-black align-items-start mb-1">
                        <h6 className="fw-bold mb-0">{historyItem.taskName}</h6>
                        <Badge bg={getStatusColor(historyItem.currentStatus)}>
                          {historyItem.currentStatus?.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-muted small mb-2">
                        Assigned: {formatDate(historyItem.assignedAt)} | Due:{" "}
                        {formatDate(historyItem.dueDate)}
                      </p>

                      {historyItem.statusUpdates?.map((update, updateIndex) => (
                        <Card
                          key={updateIndex}
                          className="mb-2 border-start border-3"
                          style={{
                            borderLeftColor: getStatusColor(update.status),
                          }}
                        >
                          <Card.Body className="py-2">
                            <div className="d-flex justify-content-between text-black align-items-start">
                              <div>
                                <Badge
                                  bg={getStatusColor(update.status)}
                                  className="mb-1 text-black"
                                >
                                  {update.status?.toUpperCase()}
                                </Badge>
                                <p className="mb-1">{update.remarks}</p>
                                <small className="text-muted">
                                  Updated by: {update.updatedByName || "System"}{" "}
                                  on {formatDate(update.updatedAt)}
                                </small>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  </div>
                  {index < entityHistory.length - 1 && (
                    <div
                      className="border-start border-2 ms-4"
                      style={{ height: "20px", marginLeft: "20px" }}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <FaHistory size={48} className="text-muted mb-3" />
              <h5 className="text-muted mb-2">No history found</h5>
              <p className="text-muted">
                No status updates have been recorded for this {entityType}.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top">
          <Button
            variant="secondary"
            onClick={() => setShowHistoryModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Files Upload Modal */}
      <Modal
        show={showFilesModal}
        onHide={() => setShowFilesModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="fw-bold">
            <FaFileUpload className="me-2" />
            Upload Task Documents
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Select Files</strong>
              </Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  const newFiles = files.map((file) => ({
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    file,
                    uploadedAt: new Date(),
                  }));
                  setUploadedFiles([...uploadedFiles, ...newFiles]);
                }}
                className="border"
              />
              <Form.Text className="text-muted">
                Upload completed forms, screenshots, or any task-related
                documents.
              </Form.Text>
            </Form.Group>

            {uploadedFiles.length > 0 && (
              <div className="mb-3">
                <strong>Uploaded Files:</strong>
                <ListGroup className="mt-2">
                  {uploadedFiles.map((file) => (
                    <ListGroup.Item
                      key={file.id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{file.name}</strong>
                        <div className="text-muted small">
                          {(file.size / 1024).toFixed(2)} KB •{" "}
                          {formatDate(file.uploadedAt)}
                        </div>
                      </div>
                      <div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setUploadedFiles(
                              uploadedFiles.filter((f) => f.id !== file.id)
                            );
                          }}
                        >
                          <FaTimes />
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-top">
          <Button variant="secondary" onClick={() => setShowFilesModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              alert("Files uploaded successfully!");
              setShowFilesModal(false);
            }}
          >
            <FaCheck className="me-1" />
            Upload Files
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TaskDetailsPage;
