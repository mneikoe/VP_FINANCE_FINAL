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
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import DOMPurify from "dompurify";
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
  FaCalendarDay,
  FaExclamationCircle,
  FaFlag,
  FaCalendarCheck,
  FaCheck,
  FaList,
  FaChartLine,
  FaUserClock,
  FaTasks,
  FaLayerGroup,
  FaAngleRight,
  FaBuilding,
  FaBox,
} from "react-icons/fa";
import { format, differenceInDays, parseISO, isValid } from "date-fns";

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

  // Get current user
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeId = user?.id;
  const employeeName = user?.username || "Employee";
  const employeeRole = user?.role || "";
  const employeeCode = user?.employeeCode || "";

  // ✅ Priority configuration
  const priorityConfig = {
    urgent: {
      bg: "#dc3545",
      color: "#fff",
      icon: <FaExclamationCircle />,
      text: "URGENT",
      order: 0,
    },
    high: {
      bg: "#fd7e14",
      color: "#fff",
      icon: <FaFlag />,
      text: "HIGH",
      order: 1,
    },
    medium: {
      bg: "#0d6efd",
      color: "#fff",
      icon: null,
      text: "MEDIUM",
      order: 2,
    },
    low: {
      bg: "#6c757d",
      color: "#fff",
      icon: null,
      text: "LOW",
      order: 3,
    },
  };

  // ✅ Status configuration
  const statusConfig = {
    pending: {
      bg: "#6c757d",
      color: "#fff",
      text: "PENDING",
      icon: <FaClock />,
    },
    "in-progress": {
      bg: "#0dcaf0",
      color: "#fff",
      text: "IN PROGRESS",
      icon: <FaUserClock />,
    },
    completed: {
      bg: "#198754",
      color: "#fff",
      text: "COMPLETED",
      icon: <FaCheckCircle />,
    },
    overdue: {
      bg: "#dc3545",
      color: "#fff",
      text: "OVERDUE",
      icon: <FaExclamationCircle />,
    },
  };

  // ✅ FIXED: Fetch employee's assigned tasks with proper data mapping
  const fetchTasks = async () => {
    setLoading(true);
    try {
      console.log(`🔄 Fetching assigned tasks for employee: ${employeeId}`);

      const response = await axios.get(`/api/Task/assigned/${employeeId}`);

      if (response.data?.success) {
        const assignedTasks = response.data.data?.tasks || [];
        console.log(`✅ Found ${assignedTasks.length} assigned tasks`);

        // ✅ DEBUG: Log first task to see structure
        if (assignedTasks.length > 0) {
          console.log("🔍 API Response Task Structure:", {
            task: assignedTasks[0],
            checklistsSource: assignedTasks[0].checklists,
            parentChecklists: assignedTasks[0].parentTask?.checklists,
            allKeys: Object.keys(assignedTasks[0]),
          });
        }

        // ✅ FIXED: Properly map all fields
        const enhancedTasks = assignedTasks.map((task) => {
          // ✅ Get checklists - check multiple sources
          const checklists =
            task.checklists || // From individual task
            task.parentTask?.checklists || // From parent composite task
            [];

          // ✅ Get company name
          const companyName = task.company || task.sub || "No Company";

          // ✅ Get product name
          const productName = task.product || task.cat?.name || "General";

          // ✅ Get priority - from assignmentDetails (ACTUAL assigned priority)
          const priority =
            task.assignmentDetails?.priority || task.priority || "medium";

          // ✅ Get due date - from assignmentDetails
          const dueDate = task.assignmentDetails?.dueDate || task.dueDate;

          // ✅ Get status
          const status =
            task.status || task.assignmentDetails?.status || "pending";

          // ✅ Get estimated days
          const estimatedDays =
            task.estimatedDays || task.parentTask?.estimatedDays || 1;

          // ✅ Get task name
          const taskName = task.name || task.parentTask?.name || "Unnamed Task";

          // ✅ Calculate days left
          const daysLeft = calculateDaysLeft(dueDate);

          // ✅ Calculate progress
          const progress = calculateProgress(task, checklists);

          return {
            // Preserve original task data
            ...task,

            // ✅ FIXED: Map all required fields properly
            _id: task.id || task._id,
            name: taskName,
            sub: companyName, // Company name
            company: companyName, // Also store as company for reference
            cat: { name: productName },
            product: productName,
            priority, // ✅ This will show URGENT if assigned as urgent
            dueDate, // ✅ This will show actual due date
            daysLeft,
            status,
            estimatedDays,
            checklists, // ✅ This will now have checklist items
            progress,
            assignmentDetails: task.assignmentDetails || {},
            parentTask: task.parentTask || {},
            remarks: task.assignmentDetails?.remarks || "",

            // Store original data for debugging
            _original: {
              task: task,
              checklistsSource: task.checklists,
              parentChecklists: task.parentTask?.checklists,
            },
          };
        });

        console.log(`📊 Enhanced tasks sample:`, enhancedTasks[0]);

        setTasks(enhancedTasks);
        setFilteredTasks(enhancedTasks);
      } else {
        console.error("❌ API returned unsuccessful:", response.data);
        setTasks([]);
        setFilteredTasks([]);
      }
    } catch (error) {
      console.error("❌ Error fetching assigned tasks:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Show user-friendly message
      if (error.response?.status === 404) {
        console.log("ℹ️ No assigned tasks found for this employee");
      }

      setTasks([]);
      setFilteredTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Calculate progress with checklists
  const calculateProgress = (task, checklists) => {
    if (!checklists || checklists.length === 0) return 0;

    // Get completed checklist items from localStorage
    const completedCount = checklists.filter((_, idx) => {
      const key = `checklist_${task.id || task._id}-${idx}`;
      return localStorage.getItem(key) === "completed";
    }).length;

    return Math.round((completedCount / checklists.length) * 100);
  };

  // ✅ FIXED: Calculate days left
  const calculateDaysLeft = (dueDate) => {
    if (!dueDate) return null;

    try {
      let due;

      // Handle different date formats
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
      console.error("❌ Error calculating days left:", error);
      return null;
    }
  };

  // ✅ Calculate task status
  const calculateTaskStatus = (task, dueDate) => {
    if (task.status === "completed") return "completed";

    const daysLeft = calculateDaysLeft(dueDate);

    if (daysLeft < 0) return "overdue";
    if (daysLeft <= 1) return "urgent";
    if (task.status === "in-progress") return "in-progress";

    return "pending";
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

  // ✅ Request sort
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // ✅ Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-muted" />;
    return sortConfig.direction === "asc" ? (
      <FaSortUp className="text-primary" />
    ) : (
      <FaSortDown className="text-primary" />
    );
  };

  // ✅ Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredTasks.length / entriesPerPage);

  // ✅ Task actions
  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleChecklistView = (task) => {
    setSelectedTask(task);
    setSelectedChecklist(task.checklists || []);
    setShowChecklistModal(true);
  };

  const updateChecklistItem = (itemIndex, status) => {
    if (!selectedTask) return;

    const key = `checklist_${selectedTask._id}-${itemIndex}`;
    localStorage.setItem(key, status);

    // Update progress in UI
    fetchTasks();
  };

  const markTaskAsCompleted = async (taskId) => {
    try {
      // Call your backend API to mark task as completed
      const response = await axios.patch(`/api/Task/${taskId}/complete`, {
        completedBy: employeeId,
        completedAt: new Date().toISOString(),
      });

      if (response.data.success) {
        alert("✅ Task marked as completed!");
        fetchTasks(); // Refresh list
      }
    } catch (error) {
      console.error("Error completing task:", error);
      alert("Failed to mark task as completed: " + error.message);
    }
  };

  // ✅ Calculate statistics
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
    urgentPriority: tasks.filter((t) => t.priority === "urgent").length,
  };

  // ✅ Format date
  const formatDate = (date) => {
    if (!date) return "Not set";
    try {
      if (date instanceof Date) {
        return format(date, "MMM dd, yyyy");
      }
      if (typeof date === "string") {
        return format(parseISO(date), "MMM dd, yyyy");
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
        <span className="text-danger fw-bold">{Math.abs(days)} days late</span>
      );
    } else if (days === 0) {
      return <span className="text-warning fw-bold">Due today</span>;
    } else if (days <= 2) {
      return (
        <span className="text-warning">
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

  // Loading state
  if (loading) {
    return (
      <div className="container-fluid mt-4">
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="text-muted">Loading your tasks...</h5>
            <p className="text-muted small">
              Fetching assigned tasks for {employeeName}
            </p>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-3 relative bottom-7">
      {/* Header */}
      <div className="d-flex  justify-content-between align-items-center mb-4">
        <div>
          <p className="text-muted mb-0">
            {employeeName} • {employeeRole} • {employeeCode}
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={fetchTasks}
            className="border"
          >
            ↻ Refresh
          </Button>
          <Dropdown>
            <Dropdown.Toggle variant="light" size="sm" className="border">
              <FaFilter className="me-2" />
              Filters
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Header>Status</Dropdown.Header>
              {Object.entries(statusConfig).map(([key, config]) => (
                <Dropdown.Item
                  key={key}
                  active={filterStatus === key}
                  onClick={() =>
                    setFilterStatus(filterStatus === key ? "all" : key)
                  }
                >
                  <Badge
                    bg={config.bg}
                    className="me-2"
                    pill
                    style={{ width: "10px", height: "10px" }}
                  />
                  {config.text}
                </Dropdown.Item>
              ))}
              <Dropdown.Divider />
              <Dropdown.Header>Priority</Dropdown.Header>
              {Object.entries(priorityConfig).map(([key, config]) => (
                <Dropdown.Item
                  key={key}
                  active={filterPriority === key}
                  onClick={() =>
                    setFilterPriority(filterPriority === key ? "all" : key)
                  }
                >
                  <Badge
                    bg={config.bg}
                    className="me-2"
                    pill
                    style={{ width: "10px", height: "10px" }}
                  />
                  {config.text}
                </Dropdown.Item>
              ))}
              <Dropdown.Divider />
              <Dropdown.Item
                onClick={() => {
                  setFilterStatus("all");
                  setFilterPriority("all");
                }}
              >
                Clear All Filters
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          {
            label: "Total Tasks",
            value: stats.total,
            icon: <FaTasks />,
            color: "dark",
          },
          {
            label: "Pending",
            value: stats.pending,
            icon: <FaClock />,
            color: "primary",
          },
          {
            label: "In Progress",
            value: stats.inProgress,
            icon: <FaUserClock />,
            color: "info",
          },
          {
            label: "Completed",
            value: stats.completed,
            icon: <FaCheckCircle />,
            color: "success",
          },
          {
            label: "Overdue",
            value: stats.overdue,
            icon: <FaExclamationCircle />,
            color: "danger",
          },
          {
            label: "Urgent",
            value: stats.urgentPriority,
            icon: <FaFlag />,
            color: "warning",
          },
        ].map((stat, idx) => (
          <div key={idx} className="col-md-2 col-6">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center">
                  <div
                    className={`bg-${stat.color} bg-opacity-10 rounded p-2 me-3`}
                  >
                    <div className={`text-${stat.color}`}>{stat.icon}</div>
                  </div>
                  <div>
                    <h3 className="fw-bold mb-0">{stat.value}</h3>
                    <p className="text-muted small mb-0">{stat.label}</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      {/* Tasks Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="fw-bold text-dark mb-0">
                Assigned Tasks ({filteredTasks.length})
              </h6>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">Show:</span>
              <Form.Select
                size="sm"
                className="w-auto border"
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </Form.Select>
            </div>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-5">
              <FaTasks size={48} className="text-muted mb-3" />
              <h5 className="text-muted mb-2">No assigned tasks</h5>
              <p className="text-muted small mb-4">
                {tasks.length === 0
                  ? "You don't have any tasks assigned yet."
                  : "No tasks match your current filters."}
              </p>
              {tasks.length > 0 && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    setFilterStatus("all");
                    setFilterPriority("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th
                        className="py-3 px-3 border-bottom"
                        style={{ width: "5%" }}
                      >
                        <span className="text-muted">#</span>
                      </th>
                      <th
                        className="py-3 px-3 border-bottom"
                        style={{ width: "25%" }}
                      >
                        <Button
                          variant="link"
                          className="text-dark fw-bold p-0 text-decoration-none"
                        >
                          Task Name
                        </Button>
                      </th>
                      <th
                        className="py-3 px-3 border-bottom"
                        style={{ width: "15%" }}
                      >
                        <span className="text-muted">Company</span>
                      </th>
                      <th
                        className="py-3 px-3 border-bottom"
                        style={{ width: "12%" }}
                      >
                        <span className="text-muted">Product</span>
                      </th>
                      <th
                        className="py-3 px-3 border-bottom text-center"
                        style={{ width: "10%" }}
                      >
                        <Button
                          variant="link"
                          className="text-dark fw-bold p-0 text-decoration-none"
                        >
                          Priority
                        </Button>
                      </th>
                      <th
                        className="py-3 px-3 border-bottom text-center"
                        style={{ width: "12%" }}
                      >
                        <Button
                          variant="link"
                          className="text-dark fw-bold p-0 text-decoration-none"
                        >
                          Due Date
                        </Button>
                      </th>
                      <th
                        className="py-3 px-3 border-bottom text-center"
                        style={{ width: "8%" }}
                      >
                        <span className="text-muted">Checklist</span>
                      </th>
                      <th
                        className="py-3 px-3 border-bottom text-center"
                        style={{ width: "8%" }}
                      >
                        <span className="text-muted">Progress</span>
                      </th>
                      <th
                        className="py-3 px-3 border-bottom text-center"
                        style={{ width: "10%" }}
                      >
                        <span className="text-muted">Status</span>
                      </th>
                      <th
                        className="py-3 px-3 border-bottom text-center"
                        style={{ width: "5%" }}
                      >
                        <span className="text-muted">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTasks.map((task, index) => (
                      <tr key={task._id}>
                        <td className="py-3 px-3 align-middle">
                          <div className="text-muted fw-medium">
                            {indexOfFirstEntry + index + 1}
                          </div>
                        </td>
                        <td className="py-3 px-3 align-middle">
                          <div>
                            <h6 className="fw-semibold text-dark mb-1">
                              {task.name}
                            </h6>
                            {task.remarks && (
                              <small className="text-muted d-block">
                                <FaFileAlt size={10} className="me-1" />
                                {task.remarks.length > 30
                                  ? `${task.remarks.substring(0, 30)}...`
                                  : task.remarks}
                              </small>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 align-middle">
                          <div className="text-dark">
                            {task.company || task.sub || "-"}
                          </div>
                        </td>
                        <td className="py-3 px-3 align-middle">
                          <Badge bg="light" text="dark" className="px-2 py-1">
                            {task.product || task.cat?.name || "General"}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-center align-middle">
                          {priorityConfig[task.priority || "medium"]?.text}
                        </td>
                        <td className="py-3 px-3 text-center align-middle">
                          <div>
                            <div className="text-dark small">
                              {task.dueDate ? formatDate(task.dueDate) : "-"}
                            </div>
                            <div className="text-muted extra-small">
                              {renderDaysLeft(task.daysLeft)}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center align-middle">
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip>
                                <strong>Checklist Items:</strong>
                                {task.checklists &&
                                task.checklists.length > 0 ? (
                                  task.checklists.map((item, idx) => (
                                    <div key={idx} className="small">
                                      •{" "}
                                      {item.length > 30
                                        ? `${item.substring(0, 30)}...`
                                        : item}
                                    </div>
                                  ))
                                ) : (
                                  <div className="small">
                                    No checklist items
                                  </div>
                                )}
                              </Tooltip>
                            }
                          >
                            <Button
                              variant={
                                task.checklists?.length > 0
                                  ? "outline-primary"
                                  : "outline-secondary"
                              }
                              size="sm"
                              onClick={() => handleChecklistView(task)}
                              disabled={
                                !task.checklists || task.checklists.length === 0
                              }
                              className="px-2 py-1"
                            >
                              <FaList size={12} className="me-1" />
                              {task.checklists?.length || 0}
                            </Button>
                          </OverlayTrigger>
                        </td>
                        <td className="py-3 px-3 text-center align-middle">
                          <div className="d-flex align-items-center justify-content-center">
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
                        <td className="py-3 px-3 text-center align-middle">
                          <Badge
                            bg={statusConfig[task.status]?.bg}
                            className="px-3 py-1"
                            style={{ minWidth: "100px" }}
                          >
                            {statusConfig[task.status]?.icon && (
                              <span className="me-1">
                                {statusConfig[task.status].icon}
                              </span>
                            )}
                            {statusConfig[task.status]?.text ||
                              task.status?.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-center align-middle">
                          <div className="d-flex justify-content-center gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewTask(task)}
                              title="View Details"
                              className="px-2 py-1"
                            >
                              <FaEye size={12} />
                            </Button>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => markTaskAsCompleted(task._id)}
                              title="Mark Complete"
                              disabled={task.status === "completed"}
                              className="px-2 py-1"
                            >
                              <FaCheckCircle size={12} />
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

      {/* Task Detail Modal */}
      <Modal
        show={showTaskDetail}
        onHide={() => setShowTaskDetail(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Task Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && (
            <div>
              <h4 className="fw-bold text-dark mb-4">{selectedTask.name}</h4>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <Card className="border h-100">
                    <Card.Body>
                      <h6 className="text-muted mb-3">Task Information</h6>
                      <div className="mb-2">
                        <small className="text-muted d-block">Company</small>
                        <span className="fw-semibold">
                          {selectedTask.company || selectedTask.sub || "N/A"}
                        </span>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted d-block">Product</small>
                        <Badge bg="light" text="dark">
                          {selectedTask.product ||
                            selectedTask.cat?.name ||
                            "General"}
                        </Badge>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted d-block">
                          Estimated Duration
                        </small>
                        <span className="fw-semibold">
                          <FaClock className="me-1" />
                          {selectedTask.estimatedDays || 1} day
                          {selectedTask.estimatedDays !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
                <div className="col-md-6">
                  <Card className="border h-100">
                    <Card.Body>
                      <h6 className="text-muted mb-3">Assignment Details</h6>
                      <div className="mb-2">
                        <small className="text-muted d-block">Priority</small>
                        <Badge
                          bg={
                            priorityConfig[selectedTask.priority || "medium"]
                              ?.bg
                          }
                        >
                          {
                            priorityConfig[selectedTask.priority || "medium"]
                              ?.text
                          }
                        </Badge>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted d-block">Status</small>
                        <Badge bg={statusConfig[selectedTask.status]?.bg}>
                          {statusConfig[selectedTask.status]?.text ||
                            selectedTask.status}
                        </Badge>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted d-block">Due Date</small>
                        <span className="fw-semibold">
                          <FaCalendarAlt className="me-1" />
                          {selectedTask.dueDate
                            ? formatDate(selectedTask.dueDate)
                            : "Not set"}
                        </span>
                      </div>
                      {selectedTask.assignmentDetails?.remarks && (
                        <div>
                          <small className="text-muted d-block">Remarks</small>
                          <span className="fw-semibold">
                            {selectedTask.assignmentDetails.remarks}
                          </span>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <h6 className="text-dark mb-2">
                  Progress: {selectedTask.progress || 0}%
                </h6>
                <ProgressBar
                  now={selectedTask.progress || 0}
                  variant={
                    selectedTask.progress === 100 ? "success" : "primary"
                  }
                  style={{ height: "10px" }}
                />
              </div>

              {/* Actions */}
              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => handleChecklistView(selectedTask)}
                  disabled={
                    !selectedTask.checklists ||
                    selectedTask.checklists.length === 0
                  }
                >
                  <FaList className="me-2" />
                  View Checklist ({selectedTask.checklists?.length || 0})
                </Button>
                <Button
                  variant="success"
                  onClick={() => {
                    markTaskAsCompleted(selectedTask._id);
                    setShowTaskDetail(false);
                  }}
                  disabled={selectedTask.status === "completed"}
                >
                  <FaCheckCircle className="me-2" />
                  Mark Complete
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Checklist Modal */}
      <Modal
        show={showChecklistModal}
        onHide={() => setShowChecklistModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">
            <FaList className="me-2" />
            Checklist Items
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && selectedChecklist.length > 0 ? (
            <div>
              <h6 className="mb-3 text-dark">{selectedTask.name}</h6>
              <div className="list-group">
                {selectedChecklist.map((item, index) => {
                  const key = `checklist_${selectedTask._id}-${index}`;
                  const status = localStorage.getItem(key) || "pending";

                  return (
                    <div key={index} className="list-group-item border-0 p-3">
                      <div className="d-flex align-items-center">
                        <Form.Check
                          type="checkbox"
                          checked={status === "completed"}
                          onChange={(e) =>
                            updateChecklistItem(
                              index,
                              e.target.checked ? "completed" : "pending"
                            )
                          }
                          className="me-3"
                          id={`check-${selectedTask._id}-${index}`}
                        />
                        <label
                          htmlFor={`check-${selectedTask._id}-${index}`}
                          className="flex-grow-1 mb-0"
                          style={{ cursor: "pointer" }}
                        >
                          {item}
                        </label>
                        <Badge
                          bg={status === "completed" ? "success" : "light"}
                          text={status === "completed" ? "white" : "dark"}
                          className="ms-2"
                        >
                          {status === "completed" ? "✓ Done" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <FaList size={32} className="text-muted mb-3" />
              <h5 className="text-muted">No checklist items</h5>
              <p className="text-muted small">
                This task doesn't have any checklist items.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowChecklistModal(false)}>
            Close
          </Button>
          {selectedChecklist.length > 0 && (
            <Button
              variant="primary"
              onClick={() => setShowChecklistModal(false)}
            >
              Save Changes
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Footer */}
      <div className="mt-4 text-center">
        <p className="text-muted small">
          Task Management System • {employeeRole} Dashboard • {employeeName}
          <br />
          Last updated: {format(new Date(), "PPpp")}
        </p>
      </div>
    </div>
  );
};

export default TaskSummary;
