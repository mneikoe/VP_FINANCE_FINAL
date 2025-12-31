import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Badge,
  Button,
  Modal,
  Form,
  Pagination,
  ProgressBar,
  Dropdown,
  Alert,
  Tooltip,
  OverlayTrigger,
  Row,
  Col,
  ListGroup,
  Accordion,
  Spinner,
  Tabs,
  Tab,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import {
  FaEye,
  FaCheckCircle,
  FaClock,
  FaCalendarAlt,
  FaFileAlt,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaExclamationCircle,
  FaFlag,
  FaCheck,
  FaList,
  FaTasks,
  FaUserClock,
  FaAngleRight,
  FaBuilding,
  FaBox,
  FaUserFriends,
  FaUsers,
  FaInfoCircle,
  FaCalendarDay,
  FaFileSignature,
  FaClipboardList,
  FaCalendarCheck,
  FaUserTie,
  FaBriefcase,
  FaMobileAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaIdCard,
  FaLayerGroup,
  FaHistory,
  FaStickyNote,
  FaPaperclip,
  FaArrowRight,
  FaShareAlt,
  FaSync,
} from "react-icons/fa";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";

const TaskSummary = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "dueDate",
    direction: "asc",
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [checklistStatus, setChecklistStatus] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [taskClients, setTaskClients] = useState([]);
  const [taskProspects, setTaskProspects] = useState([]);
  const [showClientsModal, setShowClientsModal] = useState(false);

  // ✅ NEW: Complete Task Modal State
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionRemarks, setCompletionRemarks] = useState("");
  const [completingTask, setCompletingTask] = useState(false);

  // Get current user
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeId = user?.id;
  const employeeName = user?.username || "Employee";
  const employeeRole = user?.role || "";
  const employeeCode = user?.employeeCode || "";
  const navigate = useNavigate();

  // ✅ Priority configuration
  const priorityConfig = {
    urgent: {
      bg: "#dc3545",
      textColor: "#fff",
      text: "URGENT",
      order: 0,
      className: "bg-danger text-white",
    },
    high: {
      bg: "#fd7e14",
      textColor: "#000",
      text: "HIGH",
      order: 1,
      className: "bg-warning text-dark",
    },
    medium: {
      bg: "#0d6efd",
      textColor: "#fff",
      text: "MEDIUM",
      order: 2,
      className: "bg-primary text-white",
    },
    low: {
      bg: "#6c757d",
      textColor: "#fff",
      text: "LOW",
      order: 3,
      className: "bg-secondary text-white",
    },
  };

  // ✅ Status configuration
  const statusConfig = {
    pending: {
      bg: "#6c757d",
      textColor: "#fff",
      text: "PENDING",
      className: "bg-secondary text-white",
    },
    "in-progress": {
      bg: "#0dcaf0",
      textColor: "#000",
      text: "IN PROGRESS",
      className: "bg-info text-dark",
    },
    completed: {
      bg: "#198754",
      textColor: "#fff",
      text: "COMPLETED",
      className: "bg-success text-white",
    },
    overdue: {
      bg: "#dc3545",
      textColor: "#fff",
      text: "OVERDUE",
      className: "bg-danger text-white",
    },
  };

  // ✅ Fetch employee's assigned tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      console.log(`🔄 Fetching assigned tasks for employee: ${employeeId}`);

      const response = await axios.get(`/api/Task/assigned/${employeeId}`);

      if (response.data?.success) {
        const assignedTasks = response.data.data?.tasks || [];
        console.log(`✅ Found ${assignedTasks.length} assigned tasks`);

        // ✅ Process and enhance tasks
        const enhancedTasks = assignedTasks.map((task) => {
          // Get checklists
          const checklists =
            task.checklists || task.parentTask?.checklists || [];

          // Get company name
          const companyName = task.company || task.sub || "No Company";

          // Get product name
          const productName = task.product || task.cat?.name || "General";

          // Get priority
          const priority =
            task.assignmentDetails?.priority || task.priority || "medium";

          // Get due date
          const dueDate = task.assignmentDetails?.dueDate || task.dueDate;

          // Get status
          const status =
            task.status || task.assignmentDetails?.status || "pending";

          // Get estimated days
          const estimatedDays =
            task.estimatedDays || task.parentTask?.estimatedDays || 1;

          // Get task name
          const taskName = task.name || task.parentTask?.name || "Unnamed Task";

          // Calculate days left
          const daysLeft = calculateDaysLeft(dueDate);

          // Calculate progress
          const progress = calculateProgress(task, checklists);
          const type = task.parentTask?.type || task.type;
          // Get assigned clients/prospects
          const assignedClients = task.assignmentDetails?.assignedClients || [];
          const assignedProspects =
            task.assignmentDetails?.assignedProspects || [];

          return {
            ...task,
            _id: task.id || task._id,
            name: taskName,
            company: companyName,
            product: productName,
            priority,
            dueDate,
            daysLeft,
            status,
            estimatedDays,
            checklists,
            progress,
            type,
            assignedClients,
            assignedProspects,
            assignmentDetails: task.assignmentDetails || {},
            parentTask: task.parentTask || {},
            remarks: task.assignmentDetails?.remarks || "",
          };
        });

        setTasks(enhancedTasks);
        setFilteredTasks(enhancedTasks);
      } else {
        setTasks([]);
        setFilteredTasks([]);
      }
    } catch (error) {
      console.error("❌ Error fetching assigned tasks:", error);
      setTasks([]);
      setFilteredTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Calculate progress with checklists
  const calculateProgress = (task, checklists) => {
    if (!checklists || checklists.length === 0) return 0;

    const completedCount = checklists.filter((_, idx) => {
      const key = `checklist_${task.id || task._id}-${idx}`;
      return localStorage.getItem(key) === "completed";
    }).length;

    return Math.round((completedCount / checklists.length) * 100);
  };

  // ✅ Calculate days left
  const calculateDaysLeft = (dueDate) => {
    if (!dueDate) return null;

    try {
      let due;
      if (dueDate instanceof Date) {
        due = dueDate;
      } else if (typeof dueDate === "string") {
        due = parseISO(dueDate);
      } else {
        return null;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      due.setHours(0, 0, 0, 0);

      return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    } catch (error) {
      return null;
    }
  };

  // ✅ NEW: Complete Task Function
  const handleCompleteTask = async () => {
    if (!selectedTask) return;

    if (!completionRemarks.trim()) {
      alert("Please add completion remarks before marking as complete");
      return;
    }

    setCompletingTask(true);
    try {
      // ✅ Simple API call to update task status
      const response = await axios.put(`/api/Task/${selectedTask._id}/status`, {
        status: "completed",
        remarks: completionRemarks,
        employeeId: employeeId,
        employeeName: employeeName,
      });

      if (response.data.success) {
        alert(`✅ Task "${selectedTask.name}" marked as completed!`);

        // Clear form
        setCompletionRemarks("");
        setShowCompleteModal(false);

        // Refresh tasks list (completed task will be filtered out)
        fetchTasks();
      } else {
        alert("Failed to complete task: " + response.data.message);
      }
    } catch (error) {
      console.error("Error completing task:", error);
      alert(
        "Failed to complete task: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setCompletingTask(false);
    }
  };

  // ✅ Load task details including clients/prospects
  const loadTaskDetails = async (task) => {
    setLoadingDetails(true);
    setSelectedTask(task);

    try {
      // Load clients if assigned
      if (task.assignedClients?.length > 0) {
        const clientsResponse = await axios.post("/api/client/get-by-ids", {
          ids: task.assignedClients,
        });
        setTaskClients(clientsResponse.data?.clients || []);
      } else {
        setTaskClients([]);
      }

      // Load prospects if assigned
      if (task.assignedProspects?.length > 0) {
        const prospectsResponse = await axios.post("/api/prospect/get-by-ids", {
          ids: task.assignedProspects,
        });
        setTaskProspects(prospectsResponse.data?.prospects || []);
      } else {
        setTaskProspects([]);
      }
    } catch (error) {
      console.error("Error loading client/prospect details:", error);
      setTaskClients([]);
      setTaskProspects([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  // ✅ Handle view task
  const handleViewTask = (task) => {
    loadTaskDetails(task);
    setShowTaskDetail(true);
  };

  // ✅ Handle view clients/prospects
  const handleViewClientsProspects = (task) => {
    loadTaskDetails(task);
    setShowClientsModal(true);
  };

  // ✅ Format date
  const formatDate = (date) => {
    if (!date) return "Not set";
    try {
      if (date instanceof Date) {
        return format(date, "dd MMM yyyy");
      }
      if (typeof date === "string") {
        return format(parseISO(date), "dd MMM yyyy");
      }
      return "Invalid date";
    } catch {
      return "Invalid date";
    }
  };

  // ✅ Days left display
  const renderDaysLeft = (days) => {
    if (days === null || days === undefined) {
      return <span className="text-muted">-</span>;
    }

    if (days < 0) {
      return (
        <span className="text-danger fw-semibold">
          {Math.abs(days)} days late
        </span>
      );
    } else if (days === 0) {
      return <span className="text-warning fw-semibold">Due today</span>;
    } else if (days <= 2) {
      return (
        <span className="text-warning fw-semibold">
          {days} day{days !== 1 ? "s" : ""} left
        </span>
      );
    } else {
      return (
        <span className="text-success">
          {days} day{days !== 1 ? "s" : ""} left
        </span>
      );
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchTasks();
    }
  }, [employeeId]);

  // ✅ Apply filters
  useEffect(() => {
    let result = [...tasks];

    if (filterStatus !== "all") {
      result = result.filter((task) => task.status === filterStatus);
    }

    if (filterPriority !== "all") {
      result = result.filter((task) => task.priority === filterPriority);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (sortConfig.key === "priority") {
          const aOrder = priorityConfig[a.priority || "medium"]?.order || 3;
          const bOrder = priorityConfig[b.priority || "medium"]?.order || 3;
          return sortConfig.direction === "asc"
            ? aOrder - bOrder
            : bOrder - aOrder;
        }

        if (sortConfig.key === "dueDate") {
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredTasks(result);
    setCurrentPage(1);
  }, [tasks, filterStatus, filterPriority, sortConfig]);

  // ✅ Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredTasks.length / entriesPerPage);

  // ✅ Calculate statistics
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
    urgentPriority: tasks.filter((t) => t.priority === "urgent").length,
    withClients: tasks.filter((t) => t.assignedClients?.length > 0).length,
    withProspects: tasks.filter((t) => t.assignedProspects?.length > 0).length,
  };

  // Loading state
  if (loading) {
    return (
      <div className="container-fluid mt-4">
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h5 className="text-dark mb-2">Loading your tasks...</h5>
            <p className="text-muted small">
              Please wait while we fetch your assigned tasks
            </p>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <Button
            variant="outline-primary"
            onClick={fetchTasks}
            className="border"
          >
            <FaSync className="me-2" />
            Refresh Tasks
          </Button>
        </div>
      </div>

      {/* Tasks Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 py-3">
          <Row className="align-items-center">
            <Col md={6}>
              <h5 className="fw-bold text-dark mb-0">
                Assigned Tasks ({filteredTasks.length})
              </h5>
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-end gap-2">
                <Dropdown>
                  <Dropdown.Toggle variant="light" size="sm" className="border">
                    Status: {filterStatus === "all" ? "All" : filterStatus}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setFilterStatus("all")}>
                      All Status
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <Dropdown.Item
                        key={key}
                        active={filterStatus === key}
                        onClick={() => setFilterStatus(key)}
                      >
                        <Badge className={config.className} pill>
                          {config.text}
                        </Badge>
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown>
                  <Dropdown.Toggle variant="light" size="sm" className="border">
                    Priority:{" "}
                    {filterPriority === "all" ? "All" : filterPriority}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setFilterPriority("all")}>
                      All Priorities
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <Dropdown.Item
                        key={key}
                        active={filterPriority === key}
                        onClick={() => setFilterPriority(key)}
                      >
                        <Badge className={config.className} pill>
                          {config.text}
                        </Badge>
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-5">
              <FaTasks size={48} className="text-muted mb-3" />
              <h5 className="text-dark mb-2">No tasks found</h5>
              <p className="text-muted small mb-4">
                {tasks.length === 0
                  ? "You don't have any tasks assigned yet."
                  : "No tasks match your current filters."}
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-3 py-3">Task Category</th>
                      <th className="py-3 px-3">Task Name</th>
                      <th className="py-3 px-3">Company</th>
                      <th className="py-3 px-3">Priority</th>
                      <th className="py-3 px-3">Due Date</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Checklists</th>
                      <th className="py-3 px-3">Progress</th>
                      <th className="py-3 px-3">Client/Prospect</th>
                      <th className="py-3 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTasks.map((task) => (
                      <tr key={task._id}>
                        <td className="py-3 px-3">
                          <span className="text-dark">{task.type || "-"}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div>
                            <h6 className="fw-semibold text-dark mb-1">
                              {task.name}
                            </h6>
                            {task.remarks && (
                              <small className="text-muted d-block">
                                {task.remarks.length > 40
                                  ? `${task.remarks.substring(0, 40)}...`
                                  : task.remarks}
                              </small>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-dark">
                            {task.company || "-"}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            className={`px-3 py-1 ${
                              priorityConfig[task.priority]?.className ||
                              "bg-secondary text-white"
                            }`}
                            style={{
                              backgroundColor:
                                priorityConfig[task.priority]?.bg,
                              color: priorityConfig[task.priority]?.textColor,
                            }}
                          >
                            {priorityConfig[task.priority]?.text || "MEDIUM"}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <div>
                            <div className="text-dark small">
                              {task.dueDate ? formatDate(task.dueDate) : "-"}
                            </div>
                            <div className="small">
                              {renderDaysLeft(task.daysLeft)}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            className={`px-3 py-1 ${
                              statusConfig[task.status]?.className ||
                              "bg-secondary text-white"
                            }`}
                            style={{
                              backgroundColor: statusConfig[task.status]?.bg,
                              color: statusConfig[task.status]?.textColor,
                            }}
                          >
                            {statusConfig[task.status]?.text || "PENDING"}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <Button
                            variant={
                              task.checklists?.length > 0
                                ? "outline-primary"
                                : "outline-secondary"
                            }
                            size="sm"
                            onClick={() => {
                              setSelectedTask(task);
                              setSelectedChecklist(task.checklists || []);
                              setShowChecklistModal(true);
                            }}
                            disabled={!task.checklists?.length}
                            className="px-3"
                          >
                            <FaList className="me-1" />
                            {task.checklists?.length || 0} items
                          </Button>
                        </td>
                        <td className="py-3 px-3">
                          <div className="d-flex align-items-center">
                            <ProgressBar
                              now={task.progress || 0}
                              className="flex-grow-1 me-2"
                              style={{ height: "6px" }}
                              variant={
                                task.progress === 100 ? "success" : "primary"
                              }
                            />
                            <span className="text-dark small fw-semibold">
                              {task.progress || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div>
                            {task.assignedClients?.length > 0 && (
                              <div className="mb-1">
                                <Badge bg="success" className="me-1">
                                  {task.assignedClients.length} Client(s)
                                </Badge>
                              </div>
                            )}
                            {task.assignedProspects?.length > 0 && (
                              <div>
                                <Badge bg="info">
                                  {task.assignedProspects.length} Prospect(s)
                                </Badge>
                              </div>
                            )}
                            {task.assignedClients?.length === 0 &&
                              task.assignedProspects?.length === 0 && (
                                <span className="text-muted small">None</span>
                              )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => navigate(`/rm/task/${task._id}`)}
                              title="View Details"
                              className="px-3"
                            >
                              <FaEye className="me-1" />
                              View
                            </Button>

                            {/* ✅ NEW: Complete Task Button */}
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => {
                                setSelectedTask(task);
                                setCompletionRemarks("");
                                setShowCompleteModal(true);
                              }}
                              disabled={task.status === "completed"}
                              title="Mark as Completed"
                              className="px-3"
                            >
                              <FaCheckCircle className="me-1" />
                              Complete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredTasks.length > 0 && totalPages > 1 && (
                <Card.Footer className="bg-white border-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-muted small">
                        Showing {indexOfFirstEntry + 1} to{" "}
                        {Math.min(indexOfLastEntry, filteredTasks.length)} of{" "}
                        {filteredTasks.length} tasks
                      </span>
                    </div>
                    <Pagination className="mb-0">
                      <Pagination.Prev
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="border"
                      />
                      {[...Array(totalPages)].map((_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          active={i + 1 === currentPage}
                          onClick={() => setCurrentPage(i + 1)}
                          className="border"
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="border"
                      />
                    </Pagination>
                  </div>
                </Card.Footer>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* ✅ NEW: Complete Task Modal */}
      <Modal
        show={showCompleteModal}
        onHide={() => setShowCompleteModal(false)}
        centered
      >
        <Modal.Header className="border-bottom py-3">
          <Modal.Title className="fw-bold text-dark">
            <FaCheckCircle className="me-2 text-success" />
            Complete Task
          </Modal.Title>
          <Button
            variant="link"
            className="p-0 ms-auto"
            onClick={() => setShowCompleteModal(false)}
          >
            ×
          </Button>
        </Modal.Header>

        <Modal.Body>
          {selectedTask && (
            <div>
              <div className="mb-4">
                <h6 className="text-dark fw-semibold">{selectedTask.name}</h6>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <Badge bg="light" text="dark">
                    {selectedTask.company}
                  </Badge>
                  <Badge bg="info">{selectedTask.type || "Task"}</Badge>
                  {selectedTask.dueDate && (
                    <Badge bg="warning">
                      <FaCalendarAlt className="me-1" />
                      Due: {formatDate(selectedTask.dueDate)}
                    </Badge>
                  )}
                </div>
              </div>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  <FaStickyNote className="me-2" />
                  Completion Remarks *
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Describe what was completed, any challenges faced, results achieved..."
                  value={completionRemarks}
                  onChange={(e) => setCompletionRemarks(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Please provide details about task completion
                </Form.Text>
              </Form.Group>

              <Alert variant="warning">
                <FaExclamationCircle className="me-2" />
                <strong>Note:</strong> Once completed, this task will be removed
                from your active tasks list.
              </Alert>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-top">
          <Button
            variant="light"
            onClick={() => setShowCompleteModal(false)}
            disabled={completingTask}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleCompleteTask}
            disabled={completingTask || !completionRemarks.trim()}
          >
            {completingTask ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Completing...
              </>
            ) : (
              <>
                <FaCheckCircle className="me-2" />
                Mark as Completed
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Task Details Modal */}
      <Modal
        show={showTaskDetail}
        onHide={() => setShowTaskDetail(false)}
        size="lg"
        centered
        scrollable
      >
        <Modal.Header className="border-bottom py-3">
          <Modal.Title className="fw-bold text-dark">Task Details</Modal.Title>
          <Button
            variant="link"
            className="p-0 ms-auto"
            onClick={() => setShowTaskDetail(false)}
          >
            ×
          </Button>
        </Modal.Header>

        <Modal.Body>
          {loadingDetails ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading task details...</p>
            </div>
          ) : selectedTask ? (
            <div>
              {/* Task Header */}
              <div className="mb-4">
                <h4 className="fw-bold text-dark mb-2">{selectedTask.name}</h4>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <Badge
                    className={priorityConfig[selectedTask.priority]?.className}
                  >
                    {priorityConfig[selectedTask.priority]?.text}
                  </Badge>
                  <Badge
                    className={statusConfig[selectedTask.status]?.className}
                  >
                    {statusConfig[selectedTask.status]?.text}
                  </Badge>
                  <Badge bg="light" text="dark">
                    {selectedTask.company}
                  </Badge>
                </div>
              </div>

              {/* Task Information Grid */}
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <Card className="border h-100">
                    <Card.Body>
                      <h6 className="text-dark fw-semibold mb-3">
                        Task Information
                      </h6>
                      <div className="mb-2">
                        <small className="text-muted d-block">Company</small>
                        <span className="fw-semibold">
                          {selectedTask.company}
                        </span>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted d-block">Product</small>
                        <span className="fw-semibold">
                          {selectedTask.product}
                        </span>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted d-block">Duration</small>
                        <span className="fw-semibold">
                          {selectedTask.estimatedDays} day
                          {selectedTask.estimatedDays !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted d-block">
                          Checklist Items
                        </small>
                        <span className="fw-semibold">
                          {selectedTask.checklists?.length || 0}
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="border h-100">
                    <Card.Body>
                      <h6 className="text-dark fw-semibold mb-3">
                        Assignment Details
                      </h6>
                      <div className="mb-2">
                        <small className="text-muted d-block">Due Date</small>
                        <span className="fw-semibold">
                          {selectedTask.dueDate
                            ? formatDate(selectedTask.dueDate)
                            : "Not set"}
                        </span>
                        <div className="small">
                          {renderDaysLeft(selectedTask.daysLeft)}
                        </div>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted d-block">Progress</small>
                        <div className="d-flex align-items-center">
                          <ProgressBar
                            now={selectedTask.progress || 0}
                            className="flex-grow-1 me-2"
                            style={{ height: "8px" }}
                            variant={
                              selectedTask.progress === 100
                                ? "success"
                                : "primary"
                            }
                          />
                          <span className="fw-semibold">
                            {selectedTask.progress || 0}%
                          </span>
                        </div>
                      </div>
                      {selectedTask.remarks && (
                        <div>
                          <small className="text-muted d-block">Remarks</small>
                          <span className="fw-semibold">
                            {selectedTask.remarks}
                          </span>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Checklists Section */}
              {selectedTask.checklists?.length > 0 && (
                <Card className="border mb-4">
                  <Card.Header className="bg-light">
                    <h6 className="text-dark fw-semibold mb-0">
                      Checklist Items
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush">
                      {selectedTask.checklists.map((item, index) => {
                        const key = `checklist_${selectedTask._id}-${index}`;
                        const status = localStorage.getItem(key) || "pending";

                        return (
                          <ListGroup.Item key={index} className="border-0 px-0">
                            <div className="d-flex align-items-center">
                              <Form.Check
                                type="checkbox"
                                checked={status === "completed"}
                                onChange={(e) => {
                                  const newStatus = e.target.checked
                                    ? "completed"
                                    : "pending";
                                  localStorage.setItem(key, newStatus);
                                  fetchTasks();
                                }}
                                className="me-3"
                                id={`check-${selectedTask._id}-${index}`}
                              />
                              <label
                                htmlFor={`check-${selectedTask._id}-${index}`}
                                className={`flex-grow-1 mb-0 ${
                                  status === "completed"
                                    ? "text-decoration-line-through text-muted"
                                    : "text-dark"
                                }`}
                                style={{ cursor: "pointer" }}
                              >
                                {item}
                              </label>
                              <Badge
                                bg={
                                  status === "completed" ? "success" : "light"
                                }
                                text={status === "completed" ? "white" : "dark"}
                                className="ms-2"
                              >
                                {status === "completed"
                                  ? "Completed"
                                  : "Pending"}
                              </Badge>
                            </div>
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  </Card.Body>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="d-flex gap-2 mt-4 pt-3 border-top">
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowTaskDetail(false);
                    setShowChecklistModal(true);
                  }}
                  disabled={!selectedTask.checklists?.length}
                >
                  Manage Checklists
                </Button>
                <Button
                  variant="success"
                  onClick={() => {
                    setShowTaskDetail(false);
                    setCompletionRemarks("");
                    setShowCompleteModal(true);
                  }}
                  disabled={selectedTask.status === "completed"}
                >
                  <FaCheckCircle className="me-2" />
                  Complete Task
                </Button>
                <Button
                  variant="light"
                  onClick={() => setShowTaskDetail(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <FaExclamationCircle size={48} className="text-muted mb-3" />
              <h5 className="text-muted mb-2">Task not found</h5>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* ✅ Checklist Modal */}
      <Modal
        show={showChecklistModal}
        onHide={() => setShowChecklistModal(false)}
        centered
      >
        <Modal.Header className="border-bottom py-3">
          <Modal.Title className="fw-bold text-dark">
            Checklist Items
          </Modal.Title>
          <Button
            variant="link"
            className="p-0 ms-auto"
            onClick={() => setShowChecklistModal(false)}
          >
            ×
          </Button>
        </Modal.Header>

        <Modal.Body>
          {selectedTask && selectedChecklist.length > 0 ? (
            <div>
              <h6 className="text-dark fw-semibold mb-3">
                {selectedTask.name}
              </h6>
              <ListGroup variant="flush">
                {selectedChecklist.map((item, index) => {
                  const key = `checklist_${selectedTask._id}-${index}`;
                  const status = localStorage.getItem(key) || "pending";

                  return (
                    <ListGroup.Item key={index} className="border-0 px-0 py-2">
                      <div className="d-flex align-items-center">
                        <Form.Check
                          type="checkbox"
                          checked={status === "completed"}
                          onChange={(e) => {
                            const newStatus = e.target.checked
                              ? "completed"
                              : "pending";
                            localStorage.setItem(key, newStatus);
                            fetchTasks();
                          }}
                          className="me-3"
                          id={`modal-check-${selectedTask._id}-${index}`}
                        />
                        <label
                          htmlFor={`modal-check-${selectedTask._id}-${index}`}
                          className={`flex-grow-1 mb-0 ${
                            status === "completed"
                              ? "text-decoration-line-through text-muted"
                              : "text-dark"
                          }`}
                          style={{ cursor: "pointer" }}
                        >
                          {item}
                        </label>
                        <Badge
                          bg={status === "completed" ? "success" : "light"}
                          text={status === "completed" ? "white" : "dark"}
                          className="ms-2"
                        >
                          {status === "completed" ? "Completed" : "Pending"}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </div>
          ) : (
            <div className="text-center py-5">
              <FaList size={32} className="text-muted mb-3" />
              <h5 className="text-muted mb-2">No checklist items</h5>
              <p className="text-muted small">
                This task doesn't have any checklist items.
              </p>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-top">
          <Button variant="light" onClick={() => setShowChecklistModal(false)}>
            Close
          </Button>
          {selectedChecklist.length > 0 && (
            <Button
              variant="primary"
              onClick={() => {
                fetchTasks();
                setShowChecklistModal(false);
              }}
            >
              Save Changes
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Footer */}
      <div className="mt-4 pt-3 border-top">
        <p className="text-muted small text-center">
          Task Management System • {employeeRole} Dashboard • {employeeName}
        </p>
      </div>
    </div>
  );
};

export default TaskSummary;
