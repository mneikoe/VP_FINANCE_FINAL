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
import { Table as AntTable, Tag as AntTag, Space as AntSpace } from "antd";

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
  const [activeTaskTab, setActiveTaskTab] = useState("assigned");

  // ✅ Complete Task Modal State
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionRemarks, setCompletionRemarks] = useState("");
  const [completingTask, setCompletingTask] = useState(false);
  const [selectedCompletionClients, setSelectedCompletionClients] = useState([]);
  const [selectedCompletionProspects, setSelectedCompletionProspects] = useState([]);
  // Forward to OE (when RM completes)
  const [forwardToOE, setForwardToOE] = useState(false);
  const [selectedOEId, setSelectedOEId] = useState("");
  const [forwardRemark, setForwardRemark] = useState("");
  const [oeList, setOeList] = useState([]);
  const [loadingOE, setLoadingOE] = useState(false);

  // ✅ NEW: Standalone Forward-to-OE Modal State
  const [showForwardOEModal, setShowForwardOEModal] = useState(false);
  const [forwardOETaskId, setForwardOETaskId] = useState(null);
  const [forwardOETask, setForwardOETask] = useState(null);
  const [forwardOESelectedOE, setForwardOESelectedOE] = useState("");
  const [forwardOERemark, setForwardOERemark] = useState("");
  const [forwardOEStatus, setForwardOEStatus] = useState("keep");
  const [forwardOESubmitting, setForwardOESubmitting] = useState(false);

  // Get current user
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeId = user?.id || user?._id;
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
          const taskMode = task.taskMode || task.parentTask?.taskMode || "assigned";
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
            taskMode,
            monthlyWindowFrom:
              task.monthlyWindowFrom ?? task.parentTask?.monthlyWindowFrom ?? null,
            monthlyWindowTo:
              task.monthlyWindowTo ?? task.parentTask?.monthlyWindowTo ?? null,
            currentMonthStatus: task.currentMonthStatus || "pending",
            pendingPreviousMonths: task.pendingPreviousMonths || [],
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

  // ✅ Fetch OE list
  const fetchOEList = async () => {
    setLoadingOE(true);
    try {
      const response = await axios.get("/api/employee/getAllEmployees", {
        params: { role: "OE" },
      });
      if (response.data?.success && Array.isArray(response.data?.data)) {
        const list = response.data.data.filter((e) => !e.dateOfTermination);
        setOeList(list);
        if (list.length > 0 && !selectedOEId) setSelectedOEId(list[0]._id);
      } else {
        setOeList([]);
      }
    } catch (err) {
      console.error("Error fetching OE list:", err);
      setOeList([]);
    } finally {
      setLoadingOE(false);
    }
  };

  // ✅ NEW: Open standalone Forward-to-OE Modal
  const openForwardOEModal = async (task) => {
    setForwardOETask(task);
    setForwardOETaskId(task._id);
    setForwardOERemark("");
    setForwardOEStatus("keep");
    setForwardOESelectedOE("");
    setShowForwardOEModal(true);
    // Fetch OE list if not loaded
    if (oeList.length === 0) fetchOEList();
  };

  // ✅ NEW: Submit standalone RM → OE forward
  const handleRMForwardToOE = async () => {
    if (!forwardOETaskId || !forwardOESelectedOE) {
      alert("Please select an OE to forward the task to.");
      return;
    }
    setForwardOESubmitting(true);
    try {
      const response = await axios.post("/api/Task/rm-forward-to-oe", {
        taskId: forwardOETaskId,
        oeId: forwardOESelectedOE,
        remark: forwardOERemark,
        status: forwardOEStatus,
        rmId: employeeId,
        employeeId: employeeId,
      });
      if (response.data?.success) {
        alert("✅ Task forwarded to OE successfully!");
        setShowForwardOEModal(false);
        fetchTasks();
      } else {
        alert("Failed: " + (response.data?.message || "Unknown error"));
      }
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    } finally {
      setForwardOESubmitting(false);
    }
  };

  const fetchRMAllottedCustomers = async () => {
    if (!employeeId) {
      return { clients: [], prospects: [] };
    }
    try {
      const allottedRes = await axios.get("/api/rm/allotted-customers", {
        params: { rmId: employeeId },
      });
      if (allottedRes.data?.success) {
        return {
          clients: allottedRes.data.data?.clients || [],
          prospects: allottedRes.data.data?.prospects || [],
        };
      }
    } catch (error) {
      console.error("Error fetching RM allotted customers:", error);
    }
    return { clients: [], prospects: [] };
  };

  const openCompleteModalForTask = async (task) => {
    let preparedTask = task;
    if (task?.taskMode === "default") {
      const allotted = await fetchRMAllottedCustomers();
      preparedTask = {
        ...task,
        assignedClients: allotted.clients,
        assignedProspects: allotted.prospects,
      };
    }
    setSelectedTask(preparedTask);
    setCompletionRemarks("");
    setSelectedCompletionClients([]);
    setSelectedCompletionProspects([]);
    setShowCompleteModal(true);
  };

  // ✅ NEW: Complete Task Function (with optional Forward to OE)
  const handleCompleteTask = async () => {
    if (!selectedTask) return;

    if (!completionRemarks.trim()) {
      alert("Please add completion remarks before marking as complete");
      return;
    }
    if (selectedTask.taskMode !== "default" && forwardToOE && !selectedOEId) {
      alert("Please select an OE to forward the task to");
      return;
    }

    setCompletingTask(true);
    try {
      if (selectedTask.taskMode !== "default" && forwardToOE && selectedOEId) {
        const response = await axios.post("/api/Task/forward-to-oe", {
          taskId: selectedTask._id,
          oeId: selectedOEId,
          remark: forwardRemark,
          completionRemarks,
          rmId: employeeId,
          employeeId: employeeId,
        });
        if (response.data?.success) {
          alert(`✅ Task completed and forwarded to OE!`);
          setCompletionRemarks("");
          setForwardToOE(false);
          setSelectedOEId("");
          setForwardRemark("");
          setShowCompleteModal(false);
          fetchTasks();
        } else {
          alert("Failed: " + (response.data?.message || "Unknown error"));
        }
      } else {
        const response = await axios.put(`/api/Task/${selectedTask._id}/status`, {
          status: "completed",
          remarks: completionRemarks,
          employeeId: employeeId,
          employeeName: employeeName,
          monthKey:
            selectedTask.taskMode === "default"
              ? `${new Date().getFullYear()}-${String(
                  new Date().getMonth() + 1
                ).padStart(2, "0")}`
              : undefined,
          completedForClients:
            selectedTask.taskMode === "default" ? selectedCompletionClients : [],
          completedForProspects:
            selectedTask.taskMode === "default" ? selectedCompletionProspects : [],
        });
        if (response.data?.success) {
          alert(`✅ Task "${selectedTask.name}" marked as completed!`);
          setCompletionRemarks("");
          setShowCompleteModal(false);
          fetchTasks();
        } else {
          alert("Failed to complete task: " + response.data?.message);
        }
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
    let taskForDetails = task;

    try {
      if (task.taskMode === "default") {
        const allotted = await fetchRMAllottedCustomers();
        taskForDetails = {
          ...task,
          assignedClients: allotted.clients,
          assignedProspects: allotted.prospects,
        };
      }
      setSelectedTask(taskForDetails);

      // Load clients if assigned
      if (taskForDetails.assignedClients?.length > 0) {
        const clientsResponse = await axios.post("/api/client/get-by-ids", {
          ids: taskForDetails.assignedClients,
        });
        setTaskClients(clientsResponse.data?.clients || []);
      } else {
        setTaskClients([]);
      }

      // Load prospects if assigned
      if (taskForDetails.assignedProspects?.length > 0) {
        const prospectsResponse = await axios.post("/api/prospect/get-by-ids", {
          ids: taskForDetails.assignedProspects,
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
    result = result.filter((task) =>
      activeTaskTab === "default"
        ? task.taskMode === "default"
        : task.taskMode !== "default"
    );

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
  }, [tasks, filterStatus, filterPriority, sortConfig, activeTaskTab]);

  // ✅ Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredTasks.length / entriesPerPage);
  const tableData = currentTasks.map((task) => ({ ...task, key: task._id }));
  const tableColumns = [
    {
      title: "Task Category",
      dataIndex: "type",
      key: "type",
      render: (val) => val || "-",
      width: 120,
    },
    {
      title: "Task Name",
      key: "name",
      width: 300,
      render: (_, task) => (
        <div>
          <div className="fw-semibold text-dark">{task.name}</div>
          {task.taskMode === "default" && (
            <div className="mt-1">
              <AntTag color="blue">
                Window: {task.monthlyWindowFrom || "-"} - {task.monthlyWindowTo || "-"}
              </AntTag>
              <AntTag color={task.currentMonthStatus === "completed" ? "green" : "orange"}>
                This Month: {task.currentMonthStatus}
              </AntTag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
      width: 160,
      render: (val) => val || "-",
    },
    {
      title: "Priority",
      key: "priority",
      width: 120,
      render: (_, task) => (
        <AntTag color={task.priority === "urgent" ? "red" : task.priority === "high" ? "orange" : task.priority === "medium" ? "blue" : "default"}>
          {priorityConfig[task.priority]?.text || "MEDIUM"}
        </AntTag>
      ),
    },
    {
      title: "Due / Timeline",
      key: "dueDate",
      width: 160,
      render: (_, task) =>
        task.taskMode === "default" ? (
          <span className="text-muted small">Monthly recurring</span>
        ) : (
          <div>
            <div className="small">{task.dueDate ? formatDate(task.dueDate) : "-"}</div>
            <div className="small">{renderDaysLeft(task.daysLeft)}</div>
          </div>
        ),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, task) => (
        <AntTag color={task.status === "completed" ? "green" : task.status === "in-progress" ? "blue" : task.status === "overdue" ? "red" : "default"}>
          {statusConfig[task.status]?.text || "PENDING"}
        </AntTag>
      ),
    },
    {
      title: "Client / Prospect",
      key: "entities",
      width: 180,
      render: (_, task) => (
        <div>
          <div className="small">C: {task.assignedClients?.length || 0}</div>
          <div className="small">P: {task.assignedProspects?.length || 0}</div>
          {task.taskMode === "default" && task.pendingPreviousMonths?.length > 0 && (
            <AntTag color="red">Pending months: {task.pendingPreviousMonths.length}</AntTag>
          )}
        </div>
      ),
    },
    {
      title: "Forwarded",
      key: "forwarded",
      width: 110,
      render: (_, task) => (
        task.forwardedFromRM?.forwardedAt ? (
          <span className="badge bg-primary" style={{ fontSize: "10px" }}>
            <FaShareAlt className="me-1" />Fwd'd to OE
          </span>
        ) : null
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 240,
      render: (_, task) => (
        <AntSpace wrap>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => navigate(`/rm/task/${task._id}`)}
          >
            <FaEye className="me-1" />
            View
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={() => openCompleteModalForTask(task)}
            disabled={task.status === "completed"}
          >
            <FaCheckCircle className="me-1" />
            Complete
          </Button>
          {task.taskMode !== "default" && (
            <Button
              variant="outline-info"
              size="sm"
              onClick={() => openForwardOEModal(task)}
              title="Forward this task to an OE"
            >
              <FaShareAlt className="me-1" />
              Fwd OE
            </Button>
          )}
        </AntSpace>
      ),
    },
  ];

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
  const tabLabel = activeTaskTab === "default" ? "Default Tasks" : "Assigned Tasks";
  const tabVariant = activeTaskTab === "default" ? "info" : "primary";
  const tabStats = {
    total: filteredTasks.length,
    dueSoon: filteredTasks.filter(
      (task) => task.daysLeft !== null && task.daysLeft >= 0 && task.daysLeft <= 2
    ).length,
    overdue: filteredTasks.filter((task) => task.daysLeft !== null && task.daysLeft < 0)
      .length,
    completedThisMonth: filteredTasks.filter(
      (task) => task.taskMode === "default" && task.currentMonthStatus === "completed"
    ).length,
    pendingMonths: filteredTasks.reduce(
      (acc, task) => acc + (task.pendingPreviousMonths?.length || 0),
      0
    ),
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
        <div>
          <h4 className="mb-1 fw-bold text-dark">Task Summary</h4>
          <p className="text-muted small mb-0">
            Better visibility for recurring default tasks and regular assignments.
          </p>
        </div>
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
          <Tabs
            activeKey={activeTaskTab}
            onSelect={(key) => setActiveTaskTab(key || "assigned")}
            className="mb-3"
          >
            <Tab eventKey="assigned" title="Assigned Tasks" />
            <Tab eventKey="default" title="Default Tasks" />
          </Tabs>
          <Row className="align-items-center">
            <Col md={6}>
              <div className="d-flex align-items-center gap-2">
                <Badge bg={tabVariant} pill className="px-3 py-2">
                  {tabLabel}
                </Badge>
                <h5 className="fw-bold text-dark mb-0">{filteredTasks.length}</h5>
              </div>
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
          <div className="px-3 py-3 border-bottom bg-light-subtle">
            <Row className="g-2">
              <Col xs={6} md={3} lg={2}>
                <div className="bg-white border rounded p-2">
                  <small className="text-muted d-block">Total</small>
                  <span className="fw-bold">{tabStats.total}</span>
                </div>
              </Col>
              <Col xs={6} md={3} lg={2}>
                <div className="bg-white border rounded p-2">
                  <small className="text-muted d-block">Due Soon</small>
                  <span className="fw-bold text-warning">{tabStats.dueSoon}</span>
                </div>
              </Col>
              <Col xs={6} md={3} lg={2}>
                <div className="bg-white border rounded p-2">
                  <small className="text-muted d-block">Overdue</small>
                  <span className="fw-bold text-danger">{tabStats.overdue}</span>
                </div>
              </Col>
              {activeTaskTab === "default" && (
                <>
                  <Col xs={6} md={3} lg={3}>
                    <div className="bg-white border rounded p-2">
                      <small className="text-muted d-block">Completed This Month</small>
                      <span className="fw-bold text-success">
                        {tabStats.completedThisMonth}
                      </span>
                    </div>
                  </Col>
                  <Col xs={6} md={3} lg={3}>
                    <div className="bg-white border rounded p-2">
                      <small className="text-muted d-block">Pending Month Logs</small>
                      <span className="fw-bold text-danger">{tabStats.pendingMonths}</span>
                    </div>
                  </Col>
                </>
              )}
            </Row>
          </div>
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
              <AntTable
                columns={tableColumns}
                dataSource={tableData}
                pagination={false}
                size="middle"
                scroll={{ x: 1300 }}
              />

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
        onHide={() => {
          setShowCompleteModal(false);
          setForwardToOE(false);
          setSelectedOEId("");
          setForwardRemark("");
        }}
        onShow={fetchOEList}
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

              {selectedTask?.taskMode !== "default" && (
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="forward-to-oe"
                    label={
                      <>
                        <FaShareAlt className="me-2" />
                        Also forward to OE
                      </>
                    }
                    checked={forwardToOE}
                    onChange={(e) => setForwardToOE(e.target.checked)}
                  />
                </Form.Group>
              )}
              {selectedTask?.taskMode !== "default" && forwardToOE && (
                <>
                  <Form.Group className="mb-2">
                    <Form.Label>Select OE</Form.Label>
                    <Form.Select
                      value={selectedOEId}
                      onChange={(e) => setSelectedOEId(e.target.value)}
                      disabled={loadingOE}
                    >
                      <option value="">-- Select OE --</option>
                      {oeList.map((oe) => (
                        <option key={oe._id} value={oe._id}>
                          {oe.name} ({oe.oeType === "onfield" ? "On Field" : "In House"})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Remark for OE (optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Message/remark for OE..."
                      value={forwardRemark}
                      onChange={(e) => setForwardRemark(e.target.value)}
                    />
                  </Form.Group>
                </>
              )}

              <Alert variant="warning">
                <FaExclamationCircle className="me-2" />
                <strong>Note:</strong>{" "}
                {selectedTask?.taskMode === "default"
                  ? "Default task complete karne par monthly log save hoga, task list me visible rahega."
                  : "Assigned task complete karne par wo active list se remove ho jayega."}
              </Alert>
              {selectedTask?.taskMode === "default" && (
                <Alert variant="info">
                  <strong>Default Task:</strong> completion month-wise save hogi,
                  task list se remove nahi hoga.
                </Alert>
              )}
              {selectedTask?.taskMode === "default" && (
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Clients completed for
                      </Form.Label>
                      <Form.Select
                        multiple
                        value={selectedCompletionClients}
                        onChange={(e) =>
                          setSelectedCompletionClients(
                            Array.from(e.target.selectedOptions).map((o) => o.value)
                          )
                        }
                      >
                        {(selectedTask.assignedClients || []).map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.personalDetails?.groupName || c.personalDetails?.name || "Client"}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Prospects completed for
                      </Form.Label>
                      <Form.Select
                        multiple
                        value={selectedCompletionProspects}
                        onChange={(e) =>
                          setSelectedCompletionProspects(
                            Array.from(e.target.selectedOptions).map((o) => o.value)
                          )
                        }
                      >
                        {(selectedTask.assignedProspects || []).map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.personalDetails?.groupName || p.personalDetails?.name || "Prospect"}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              )}
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

      {/* ✅ NEW: Standalone Forward-to-OE Modal */}
      <Modal
        show={showForwardOEModal}
        onHide={() => setShowForwardOEModal(false)}
        centered
        size="lg"
        scrollable
      >
        <Modal.Header
          closeButton
          style={{ background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)", color: "white" }}
        >
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaShareAlt />
            Forward Task to OE
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-0">
          {forwardOETask && (
            <>
              {/* Task Info Banner */}
              <div className="bg-light border-bottom px-4 py-3">
                <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
                  <div>
                    <h6 className="fw-bold text-dark mb-1">{forwardOETask.name}</h6>
                    <div className="d-flex flex-wrap gap-2">
                      <Badge bg="light" text="dark" className="border">{forwardOETask.company}</Badge>
                      <Badge bg="info" text="dark">{forwardOETask.type || "Task"}</Badge>
                      <Badge className={priorityConfig[forwardOETask.priority]?.className || "bg-secondary text-white"}>
                        {priorityConfig[forwardOETask.priority]?.text || "MEDIUM"}
                      </Badge>
                      <Badge className={statusConfig[forwardOETask.status]?.className || "bg-secondary text-white"}>
                        Current: {statusConfig[forwardOETask.status]?.text || forwardOETask.status}
                      </Badge>
                    </div>
                  </div>
                  {forwardOETask.dueDate && (
                    <Badge bg="warning" text="dark">
                      <FaCalendarAlt className="me-1" />Due: {formatDate(forwardOETask.dueDate)}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Clients & Prospects Section */}
              {((forwardOETask.assignedClients?.length > 0) || (forwardOETask.assignedProspects?.length > 0)) && (
                <div className="px-4 pt-3 pb-2">
                  <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                    <FaUsers /> Associated Clients & Prospects
                    <Badge bg="secondary" pill>
                      {(forwardOETask.assignedClients?.length || 0) + (forwardOETask.assignedProspects?.length || 0)}
                    </Badge>
                  </h6>
                  <Row className="g-2">
                    {(forwardOETask.assignedClients || []).length > 0 && (
                      <Col md={6}>
                        <Card className="border-success h-100">
                          <Card.Header className="bg-success text-white py-2 d-flex align-items-center gap-2">
                            <FaUserTie size={12} />
                            <small className="fw-bold">Clients ({forwardOETask.assignedClients.length})</small>
                          </Card.Header>
                          <ListGroup variant="flush" style={{ maxHeight: 160, overflowY: "auto" }}>
                            {(forwardOETask.assignedClients || []).map((c, i) => (
                              <ListGroup.Item key={i} className="py-2 px-3">
                                <div className="d-flex align-items-center gap-2">
                                  <FaIdCard size={11} className="text-muted flex-shrink-0" />
                                  <div>
                                    <div className="fw-semibold small">
                                      {c?.personalDetails?.groupName || c?.personalDetails?.name || `Client ${i + 1}`}
                                    </div>
                                    {c?.personalDetails?.mobileNo && (
                                      <div className="text-muted" style={{ fontSize: 11 }}>
                                        <FaPhone size={9} className="me-1" />{c.personalDetails.mobileNo}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </Card>
                      </Col>
                    )}
                    {(forwardOETask.assignedProspects || []).length > 0 && (
                      <Col md={6}>
                        <Card className="border-primary h-100">
                          <Card.Header className="bg-primary text-white py-2 d-flex align-items-center gap-2">
                            <FaUserFriends size={12} />
                            <small className="fw-bold">Prospects ({forwardOETask.assignedProspects.length})</small>
                          </Card.Header>
                          <ListGroup variant="flush" style={{ maxHeight: 160, overflowY: "auto" }}>
                            {(forwardOETask.assignedProspects || []).map((p, i) => (
                              <ListGroup.Item key={i} className="py-2 px-3">
                                <div className="d-flex align-items-center gap-2">
                                  <FaIdCard size={11} className="text-muted flex-shrink-0" />
                                  <div>
                                    <div className="fw-semibold small">
                                      {p?.personalDetails?.groupName || p?.personalDetails?.name || `Prospect ${i + 1}`}
                                    </div>
                                    {p?.personalDetails?.mobileNo && (
                                      <div className="text-muted" style={{ fontSize: 11 }}>
                                        <FaPhone size={9} className="me-1" />{p.personalDetails.mobileNo}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </Card>
                      </Col>
                    )}
                  </Row>
                </div>
              )}

              {/* Form Fields */}
              <div className="px-4 py-3">
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        <FaUserTie className="me-1 text-primary" />
                        Select OE <span className="text-danger">*</span>
                      </Form.Label>
                      {loadingOE ? (
                        <div className="d-flex align-items-center gap-2 p-2 border rounded">
                          <Spinner size="sm" animation="border" />
                          <small className="text-muted">Loading OE list...</small>
                        </div>
                      ) : (
                        <Form.Select
                          value={forwardOESelectedOE}
                          onChange={(e) => setForwardOESelectedOE(e.target.value)}
                          isInvalid={!forwardOESelectedOE}
                        >
                          <option value="">-- Select OE --</option>
                          {oeList.map((oe) => (
                            <option key={oe._id} value={oe._id}>
                              {oe.name} ({oe.oeType === "onfield" ? "On Field" : "In House"})
                              {oe.employeeCode ? ` [${oe.employeeCode}]` : ""}
                            </option>
                          ))}
                        </Form.Select>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        <FaFlag className="me-1 text-warning" />
                        Task Status after Forwarding
                      </Form.Label>
                      <Form.Select
                        value={forwardOEStatus}
                        onChange={(e) => setForwardOEStatus(e.target.value)}
                      >
                        <option value="keep">Keep Current Status</option>
                        <option value="in-progress">Mark as In Progress</option>
                        <option value="completed">Mark as Completed</option>
                        <option value="pending">Mark as Pending</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        <FaStickyNote className="me-1 text-secondary" />
                        Remark for OE
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Add your remarks, instructions, or notes for the OE..."
                        value={forwardOERemark}
                        onChange={(e) => setForwardOERemark(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Alert variant="info" className="mt-3 mb-0 py-2">
                  <FaInfoCircle className="me-2" />
                  <strong>Note:</strong> The complete task (with all clients &amp; prospects) will be forwarded to the selected OE. The OE can then view, act, and forward it back to an RM if needed.
                </Alert>
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="border-top">
          <Button
            variant="light"
            onClick={() => setShowForwardOEModal(false)}
            disabled={forwardOESubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRMForwardToOE}
            disabled={forwardOESubmitting || !forwardOESelectedOE}
          >
            {forwardOESubmitting ? (
              <><Spinner animation="border" size="sm" className="me-2" />Forwarding...</>
            ) : (
              <><FaShareAlt className="me-2" />Forward to OE</>
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
                      {selectedTask.taskMode !== "default" && (
                        <div className="mb-2">
                          <small className="text-muted d-block">Duration</small>
                          <span className="fw-semibold">
                            {selectedTask.estimatedDays} day
                            {selectedTask.estimatedDays !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
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
                  onClick={async () => {
                    setShowTaskDetail(false);
                    await openCompleteModalForTask(selectedTask);
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
