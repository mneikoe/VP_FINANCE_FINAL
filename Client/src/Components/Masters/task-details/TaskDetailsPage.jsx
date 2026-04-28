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
import { buildUploadUrl } from "../../../utils/uploadUrl";
import {
  Card as AntCard,
  Select as AntSelect,
  Button as AntButton,
  message,
  Tag as AntTag,
  Table as AntTable,
  Space as AntSpace,
  Modal as AntModal,
  Input as AntInput,
} from "antd";

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
  const [selectedClientIds, setSelectedClientIds] = useState([]);
  const [selectedProspectIds, setSelectedProspectIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("in-progress");
  const [bulkRemarks, setBulkRemarks] = useState("");
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeId = currentUser?.id || currentUser?._id;
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
  const buildEntityStatusMap = (taskData) => {
    const map = {};
    const statuses = Array.isArray(taskData?.clientProspectStatuses)
      ? taskData.clientProspectStatuses
      : [];
    statuses.forEach((entry) => {
      const id =
        typeof entry?.entityId === "string"
          ? entry.entityId
          : entry?.entityId?._id || entry?.entityId?.toString?.();
      if (id) {
        map[id] = entry;
      }
    });
    return map;
  };

  // Fetch task details
  useEffect(() => {
    fetchTaskDetails();
  }, [taskId, refreshKey]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/Task/${taskId}?type=individual`);

      if (response.data.success) {
        let taskData = response.data.task;

        const isDefaultTask = (taskData.taskMode || "assigned") === "default";

        // For default task: always use RM allotted customers (same as customer master).
        if (isDefaultTask && employeeId) {
          try {
            const allottedRes = await axios.get("/api/rm/allotted-customers", {
              params: { rmId: employeeId },
            });
            if (allottedRes.data?.success) {
              taskData = {
                ...taskData,
                assignedClients: allottedRes.data.data?.clients || [],
                assignedProspects: allottedRes.data.data?.prospects || [],
              };
            }
          } catch (allottedError) {
            console.error("Error fetching RM allotted customers:", allottedError);
          }
        }

        // For non-default tasks, use previous fallback strategy
        if (
          !isDefaultTask &&
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
        setEntityStatuses(buildEntityStatusMap(taskData));

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
      const employeeId = currentUser?.id || currentUser?._id;
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
        message.success("Status updated successfully");
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

  const handleBulkStatusUpdate = async (type) => {
    const targetIds = type === "client" ? selectedClientIds : selectedProspectIds;
    if (!targetIds.length) {
      message.warning(`Please select at least one ${type}`);
      return;
    }
    if (!bulkStatus) {
      message.warning("Please select a status");
      return;
    }
    try {
      setBulkUpdating(true);
      await Promise.all(
        targetIds.map((entityId) =>
          axios.put(`/api/Task/entity/${entityId}/task/${taskId}/status`, {
            status: bulkStatus,
            remarks: bulkRemarks,
            employeeId,
            employeeName,
            files: [],
          })
        )
      );
      message.success(`${targetIds.length} ${type}(s) updated to ${bulkStatus}`);
      setBulkRemarks("");
      if (type === "client") {
        setSelectedClientIds([]);
      } else {
        setSelectedProspectIds([]);
      }
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Bulk status update error:", error);
      message.error("Failed to update statuses");
    } finally {
      setBulkUpdating(false);
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
        className="px-3 py-1 d-inline-flex align-items-center gap-1"
        style={{ backgroundColor: config.bg, color: config.color }}
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
  const isDefaultTask = task.taskMode === "default";
  const clientColumns = [
    {
      title: "Group Code",
      dataIndex: ["personalDetails", "groupCode"],
      key: "groupCode",
      render: (val) => val || "N/A",
    },
    {
      title: "Group Name",
      dataIndex: ["personalDetails", "groupName"],
      key: "groupName",
      render: (val) => val || "Unnamed Client",
    },
    {
      title: "Mobile",
      dataIndex: ["personalDetails", "mobileNo"],
      key: "mobileNo",
      render: (val) => val || "N/A",
    },
    {
      title: "Email",
      dataIndex: ["personalDetails", "emailId"],
      key: "emailId",
      render: (val) => val || "N/A",
    },
    {
      title: "Task Status",
      key: "status",
      render: (_, record) => getEntityStatusBadge(record),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <AntSpace>
          <AntButton size="small" onClick={() => openStatusModal(record, "client")}>
            Update
          </AntButton>
          <AntButton size="small" onClick={() => openHistoryModal(record)}>
            History
          </AntButton>
        </AntSpace>
      ),
    },
  ];
  const prospectColumns = [
    {
      title: "Group Code",
      dataIndex: ["personalDetails", "groupCode"],
      key: "groupCode",
      render: (val) => val || "N/A",
    },
    {
      title: "Name",
      key: "name",
      render: (_, record) =>
        record.personalDetails?.name || record.personalDetails?.groupName || "Unnamed Prospect",
    },
    {
      title: "Mobile",
      dataIndex: ["personalDetails", "mobileNo"],
      key: "mobileNo",
      render: (val) => val || "N/A",
    },
    {
      title: "Email",
      dataIndex: ["personalDetails", "emailId"],
      key: "emailId",
      render: (val) => val || "N/A",
    },
    {
      title: "Lead Source",
      dataIndex: ["personalDetails", "leadSource"],
      key: "leadSource",
      render: (val) => val || "N/A",
    },
    {
      title: "Task Status",
      key: "status",
      render: (_, record) => getEntityStatusBadge(record),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <AntSpace>
          <AntButton size="small" onClick={() => openStatusModal(record, "prospect")}>
            Update
          </AntButton>
          <AntButton size="small" onClick={() => openHistoryModal(record)}>
            History
          </AntButton>
        </AntSpace>
      ),
    },
  ];

  return (
    <>
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- Header Section --- */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors border-0 bg-transparent p-0 cursor-pointer"
          >
            <FaArrowLeft className="mr-2" size={14} />
            Back to Tasks
          </button>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-md uppercase tracking-wide border border-indigo-100">
                  {task.type || "COMPOSITE"}
                </span>
                {!isDefaultTask && daysLeft !== null && (
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center border ${
                    daysLeft < 0 ? "bg-red-50 text-red-700 border-red-100" : "bg-amber-50 text-amber-700 border-amber-100"
                  }`}>
                    <FaClock className="mr-1.5" size={12} />
                    {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{task.name || "Task Details"}</h1>
            </div>
          </div>
        </div>

        {/* --- Metrics Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start space-x-4 transition-shadow hover:shadow-md">
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-500">
              <FaSync size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">Overall Progress</p>
              <h4 className={`text-xl font-semibold ${overallProgress === 100 ? "text-green-600" : "text-blue-600"}`}>{overallProgress}%</h4>
              <p className="text-xs text-gray-400 mt-1">Based on checklists & clients</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start space-x-4 transition-shadow hover:shadow-md">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-500">
              <FaBuilding size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">Company & Product</p>
              <h4 className="text-xl font-semibold text-gray-900">{task.company || task.sub || "N/A"}</h4>
              <p className="text-xs text-gray-400 mt-1">{task.product || task.cat?.name || "N/A"}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start space-x-4 transition-shadow hover:shadow-md">
            <div className="p-3 bg-purple-50 rounded-lg text-purple-500">
              <FaUsers size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">Assigned Entities</p>
              <h4 className="text-xl font-semibold text-gray-900">{(task.assignedClients?.length || 0) + (task.assignedProspects?.length || 0)}</h4>
              <p className="text-xs text-gray-400 mt-1">{task.assignedClients?.length || 0} Clients, {task.assignedProspects?.length || 0} Prospects</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start space-x-4 transition-shadow hover:shadow-md">
            <div className="p-3 bg-green-50 rounded-lg text-green-500">
              <FaUserTie size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">Assigned To</p>
              <h4 className="text-xl font-semibold text-gray-900">{employeeName}</h4>
              <p className="text-xs text-gray-400 mt-1">Due: {!isDefaultTask ? formatDate(task.assignmentDetails?.dueDate) : 'Monthly Task'}</p>
            </div>
          </div>
        </div>

        {/* --- Tab Navigation --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto px-6" style={{ scrollbarWidth: 'none' }} aria-label="Tabs">
              {['overview', 'clients', 'files', 'history'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors border-0 bg-transparent
                    ${activeTab === tab 
                      ? 'border-indigo-500 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                  style={activeTab === tab ? { borderBottomWidth: '2px', borderBottomStyle: 'solid', borderBottomColor: '#6366f1'} : {}}
                >
                  {tab === 'history' ? 'Activity History' : tab === 'clients' ? 'Clients & Prospects' : tab === 'files' ? 'Files & Attachments' : 'Overview'}
                </button>
              ))}
            </nav>
          </div>

          {/* --- Tab Content Area --- */}
          <div className="p-6 md:p-8">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Description Column */}
                <div className="lg:col-span-2 space-y-8">
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaFileAlt className="mr-2 text-gray-400" />
                      Task Description
                    </h3>
                    <div className="prose prose-sm text-gray-600 bg-gray-50 rounded-lg p-5 border border-gray-100">
                      <div dangerouslySetInnerHTML={{ __html: task.descp?.text || "<p>No description provided.</p>" }} />
                    </div>
                    {task.descp?.image && (
                      <div className="mt-4">
                        <img
                          src={buildUploadUrl(task.descp.image)}
                          alt="Task Document"
                          className="rounded-lg border border-gray-200 shadow-sm max-h-80 object-cover"
                        />
                      </div>
                    )}
                  </section>
                  
                  {/* Forms section */}
                  {task.formChecklists && task.formChecklists.length > 0 && (
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaPaperclip className="mr-2 text-gray-400" />
                      Required Forms
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {task.formChecklists.map((form, index) => (
                        <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                          <h6 className="font-medium text-gray-900 mb-3">{form.name}</h6>
                          <div className="flex gap-2">
                             {form.downloadFormUrl && (
                                <a
                                  href={buildUploadUrl(form.downloadFormUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1.5 border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md text-xs font-medium transition-colors no-underline"
                                >
                                  <FaDownload className="mr-1.5" /> Download
                                </a>
                              )}
                              {form.sampleFormUrl && (
                                <a
                                  href={buildUploadUrl(form.sampleFormUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md text-xs font-medium transition-colors no-underline"
                                >
                                  <FaEye className="mr-1.5" /> Sample
                                </a>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                  )}
                  
                  {/* Communication Templates */}
                  {(task.email_descp || task.sms_descp || task.whatsapp_descp) && (
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FaEnvelope className="mr-2 text-gray-400" />
                        Communication Templates
                      </h3>
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                         <Tabs defaultActiveKey="email" className="mb-4 text-sm font-medium">
                            <Tab eventKey="email" title="Email">
                              <pre className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap border border-gray-100 mt-3">{task.email_descp || "No email template provided."}</pre>
                            </Tab>
                            <Tab eventKey="sms" title="SMS">
                              <pre className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap border border-gray-100 mt-3">{task.sms_descp || "No SMS template provided."}</pre>
                            </Tab>
                            <Tab eventKey="whatsapp" title="WhatsApp">
                              <pre className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap border border-gray-100 mt-3">{task.whatsapp_descp || "No WhatsApp template provided."}</pre>
                            </Tab>
                          </Tabs>
                      </div>
                    </section>
                  )}
                </div>

                {/* Sidebar Column (Checklists) */}
                <div className="space-y-6">
                  {task.checklists && task.checklists.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-semibold text-gray-900 flex items-center">
                        <FaListAlt className="mr-2 text-gray-400" /> Checklists
                      </h3>
                      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                        {Object.values(checklistStatus).filter(Boolean).length} / {task.checklists.length}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                      <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${(Object.values(checklistStatus).filter(Boolean).length / task.checklists.length) * 100}%` }}></div>
                    </div>

                    <div className="space-y-3">
                      {task.checklists.map((item, index) => (
                        <label key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100 group mb-0">
                          <input 
                            type="checkbox" 
                            checked={checklistStatus[index] || false}
                            onChange={() => handleChecklistToggle(index)}
                            className="mt-1 h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 transition-colors" 
                          />
                          <span className={`text-sm flex-1 ${checklistStatus[index] ? "text-gray-400 line-through" : "text-gray-700 group-hover:text-gray-900"}`}>{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  )}
                </div>

              </div>
            )}
            
            {activeTab === 'clients' && (
              <div className="space-y-8">
                 {/* Keeping the Antd bulk update and tables, just wrapping them */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-0">Bulk Status Update (Professional Flow)</h3>
                    </div>
                    <div className="p-5">
                      <Row className="g-3 align-items-end">
                        <Col md={4}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Select Clients</label>
                          <AntSelect
                            mode="multiple"
                            style={{ width: "100%" }}
                            value={selectedClientIds}
                            onChange={setSelectedClientIds}
                            placeholder="Choose clients"
                            options={(task.assignedClients || []).map((c) => ({
                              value: c._id || c.id,
                              label: c.personalDetails?.groupName || c.personalDetails?.name || "Client",
                            }))}
                          />
                        </Col>
                        <Col md={4}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Select Prospects</label>
                          <AntSelect
                            mode="multiple"
                            style={{ width: "100%" }}
                            value={selectedProspectIds}
                            onChange={setSelectedProspectIds}
                            placeholder="Choose prospects"
                            options={(task.assignedProspects || []).map((p) => ({
                              value: p._id || p.id,
                              label: p.personalDetails?.groupName || p.personalDetails?.name || "Prospect",
                            }))}
                          />
                        </Col>
                        <Col md={2}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <AntSelect
                            style={{ width: "100%" }}
                            value={bulkStatus}
                            onChange={setBulkStatus}
                            options={statusOptions.map((item) => ({ value: item.value, label: item.label }))}
                          />
                        </Col>
                        <Col md={2}>
                          <AntButton type="primary" block loading={bulkUpdating} onClick={() => handleBulkStatusUpdate("client")}>
                            Update Clients
                          </AntButton>
                        </Col>
                      </Row>
                      <Row className="g-3 mt-2">
                        <Col md={10}>
                          <Form.Control as="textarea" rows={2} value={bulkRemarks} onChange={(e) => setBulkRemarks(e.target.value)} placeholder="Add remarks for selected client/prospect status update..." className="text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-md" />
                        </Col>
                        <Col md={2} className="d-flex align-items-end">
                          <AntButton block loading={bulkUpdating} onClick={() => handleBulkStatusUpdate("prospect")}>
                            Update Prospects
                          </AntButton>
                        </Col>
                      </Row>
                    </div>
                 </div>

                 <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaUserFriends className="mr-2 text-gray-400" /> Assigned Clients <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-sm">{task.assignedClients?.length || 0}</span>
                    </h4>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      {task.assignedClients?.length > 0 ? (
                        <AntTable rowKey={(record) => record._id || record.id} dataSource={task.assignedClients} columns={clientColumns} size="small" pagination={false} scroll={{ x: 900 }} />
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <FaUserFriends size={40} className="mx-auto text-gray-300 mb-3" />
                          <p className="text-sm mb-0">No clients assigned to this task.</p>
                        </div>
                      )}
                    </div>
                 </div>

                 <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaUsers className="mr-2 text-gray-400" /> Assigned Prospects <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-sm">{task.assignedProspects?.length || 0}</span>
                    </h4>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      {task.assignedProspects?.length > 0 ? (
                        <AntTable rowKey={(record) => record._id || record.id} dataSource={task.assignedProspects} columns={prospectColumns} size="small" pagination={false} scroll={{ x: 1100 }} />
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <FaUsers size={40} className="mx-auto text-gray-300 mb-3" />
                          <p className="text-sm mb-0">No prospects assigned to this task.</p>
                        </div>
                      )}
                    </div>
                 </div>

                 {/* Assignment Remarks */}
                 {(task.clientAssignmentRemarks || task.prospectAssignmentRemarks) && (
                   <div>
                     <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                       <FaStickyNote className="mr-2 text-gray-400" /> Assignment Remarks
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {task.clientAssignmentRemarks && (
                          <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm">
                            <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center"><FaUserFriends className="text-green-500 mr-2" /> Client Remarks</h5>
                            <p className="text-sm text-gray-600 mb-0">{task.clientAssignmentRemarks}</p>
                          </div>
                        )}
                        {task.prospectAssignmentRemarks && (
                          <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm">
                            <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center"><FaUsers className="text-amber-500 mr-2" /> Prospect Remarks</h5>
                            <p className="text-sm text-gray-600 mb-0">{task.prospectAssignmentRemarks}</p>
                          </div>
                        )}
                     </div>
                   </div>
                 )}
              </div>
            )}

            {activeTab === 'files' && (
              <div className="space-y-6">
                 <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                      <Form.Control type="file" multiple onChange={(e) => {
                          const files = Array.from(e.target.files);
                          const newFiles = files.map((file) => ({ id: Date.now() + Math.random(), name: file.name, size: file.size, type: file.type, file, uploadedAt: new Date() }));
                          setUploadedFiles([...uploadedFiles, ...newFiles]);
                        }} 
                        className="mb-2 w-full text-sm text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mb-0">Upload completed forms, documents, or screenshots.</p>
                    </div>
                 </div>

                 {uploadedFiles.length > 0 && (
                   <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-0">Uploaded Files</h3>
                      </div>
                      <ul className="divide-y divide-gray-200 m-0 p-0 list-none">
                        {uploadedFiles.map((file) => (
                          <li key={file.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center">
                              <FaFileAlt className="text-gray-400 mr-3 text-xl" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 mb-0">{file.name}</p>
                                <p className="text-xs text-gray-500 mb-0">{formatDate(file.uploadedAt)} • {(file.size / 1024).toFixed(2)} KB</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button className="text-gray-400 hover:text-indigo-600 transition-colors bg-transparent border-0 p-1 cursor-pointer"><FaEye size={18} /></button>
                              <button className="text-gray-400 hover:text-red-600 transition-colors bg-transparent border-0 p-1 cursor-pointer" onClick={() => setUploadedFiles(uploadedFiles.filter((f) => f.id !== file.id))}><FaTimes size={18} /></button>
                            </div>
                          </li>
                        ))}
                      </ul>
                   </div>
                 )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="max-w-3xl mx-auto">
                 <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden relative">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center"><FaHistory className="mr-2 text-gray-400" /> Task Activity</h3>
                      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                        
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                             <FaBuilding size={14} />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-lg border border-slate-200 shadow-sm z-10">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-bold text-slate-900 text-sm">Task Created</div>
                              <time className="text-xs font-medium text-indigo-500">{formatDate(task.createdAt)}</time>
                            </div>
                          </div>
                        </div>

                        {task.assignmentDetails?.assignedAt && (
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-50 text-indigo-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                             <FaUserTie size={14} />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-lg border border-slate-200 shadow-sm z-10">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-bold text-slate-900 text-sm">Task Assigned</div>
                              <time className="text-xs font-medium text-indigo-500">{formatDate(task.assignmentDetails.assignedAt)}</time>
                            </div>
                          </div>
                        </div>
                        )}

                        {task.assignmentDetails?.dueDate && (
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-amber-50 text-amber-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                             <FaCalendarAlt size={14} />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-lg border border-slate-200 shadow-sm z-10">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-bold text-slate-900 text-sm">Due Date Set</div>
                              <time className="text-xs font-medium text-indigo-500">{formatDate(task.assignmentDetails.dueDate)}</time>
                            </div>
                            {daysLeft !== null && (
                              <div className={`text-xs font-medium mt-1 ${daysLeft < 0 ? "text-red-500" : "text-emerald-500"}`}>
                                {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                              </div>
                            )}
                          </div>
                        </div>
                        )}

                        {task.completedAt && (
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-emerald-50 text-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                             <FaCheckCircle size={14} />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-lg border border-slate-200 shadow-sm z-10">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-bold text-slate-900 text-sm">Task Completed</div>
                              <time className="text-xs font-medium text-indigo-500">{formatDate(task.completedAt)}</time>
                            </div>
                          </div>
                        </div>
                        )}

                      </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Modals */}
      {/* Status Update Modal */}
      <AntModal
        open={showStatusModal}
        onCancel={() => setShowStatusModal(false)}
        title={
          <span>
            <FaUserEdit className="me-2" />
            Update {entityType === "client" ? "Client" : "Prospect"} Status
          </span>
        }
        width={760}
        footer={[
          <AntButton key="cancel" onClick={() => setShowStatusModal(false)}>
            Cancel
          </AntButton>,
          <AntButton key="save" type="primary" onClick={saveStatus}>
            <FaCheck className="me-1" />
            Save Status
          </AntButton>,
        ]}
      >
        {selectedEntity && (
          <AntCard size="small" className="mb-3">
            <Row className="g-2">
              <Col md={6}>
                <div>
                  <strong>Name:</strong> {selectedEntity.personalDetails?.name || "N/A"}
                </div>
                <div>
                  <strong>Mobile:</strong>{" "}
                  {selectedEntity.personalDetails?.mobileNo || "N/A"}
                </div>
              </Col>
              <Col md={6}>
                <div>
                  <strong>Email:</strong>{" "}
                  {selectedEntity.personalDetails?.emailId || "N/A"}
                </div>
                <div>
                  <strong>Type:</strong> {entityType.toUpperCase()}
                </div>
              </Col>
            </Row>
          </AntCard>
        )}

        <div className="mb-3">
          <label className="form-label fw-semibold">Status *</label>
          <AntSelect
            style={{ width: "100%" }}
            value={entityStatus}
            onChange={setEntityStatus}
            options={statusOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Remarks</label>
          <AntInput.TextArea
            rows={3}
            value={entityRemarks}
            onChange={(e) => setEntityRemarks(e.target.value)}
            placeholder="Add remarks about this update..."
          />
          <div className="text-muted small mt-1">
            Explain what was done or why the status is being changed.
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Upload Documents (Optional)</label>
          <Form.Control type="file" multiple onChange={handleFileSelect} className="border" />
        </div>

        {selectedFiles.length > 0 && (
          <div className="mb-2">
            <strong>Selected Files:</strong>
            <div className="mt-2 d-flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <AntTag
                  key={`${file.name}-${index}`}
                  closable
                  onClose={(e) => {
                    e.preventDefault();
                    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                  }}
                >
                  {file.name}
                </AntTag>
              ))}
            </div>
          </div>
        )}
      </AntModal>

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
    </>
  );
};

export default TaskDetailsPage;
