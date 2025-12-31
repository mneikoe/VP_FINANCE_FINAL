import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Badge,
  Card,
  Alert,
  Pagination,
  Dropdown,
  InputGroup,
  FormControl,
  Row,
  Col,
  ListGroup,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import {
  FaUserCheck,
  FaUsers,
  FaClock,
  FaPaperPlane,
  FaFilter,
  FaSearch,
  FaExclamationCircle,
  FaFlag,
  FaStar,
  FaCalendarDay,
  FaCheck,
  FaUserFriends,
  FaList,
  FaCheckCircle,
  FaTimes,
  FaEye,
  FaHistory,
  FaBullhorn,
  FaBuilding,
  FaSync,
  FaUserPlus,
  FaListAlt,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";

// ✅ Import ClientProspectSelectionModal
import ClientProspectSelectionModal from "../ClientProspectSelectionModal";

const MarketingAssignments = () => {
  const [marketingTasks, setMarketingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [employeesByRole, setEmployeesByRole] = useState({});
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // ✅ NEW: Client/Prospect Modal State
  const [showClientProspectModal, setShowClientProspectModal] = useState(false);

  // Assign Form State - SINGLE EMPLOYEE ONLY with Client/Prospect
  const [assignForm, setAssignForm] = useState({
    priority: "medium",
    remarks: "",
    dueDate: "",
    selectedEmployee: null,
    selectedRole: "",
    // ✅ NEW: Client/Prospect fields
    selectedClients: [],
    selectedProspects: [],
    clientRemarks: "",
    prospectRemarks: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch marketing tasks - सिर्फ TEMPLATE status वाले
  const fetchMarketingTasks = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await axios.get(
        "/api/Task?type=marketing&status=template"
      );
      const tasks = response.data?.tasks || response.data || [];
      setMarketingTasks(tasks);
    } catch (error) {
      console.error("Error fetching marketing tasks:", error);
      setErrorMessage("Failed to load marketing tasks. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch employees for selected role
  const fetchEmployeesForRole = async (role) => {
    setLoadingEmployees(true);
    try {
      const allEmployeesResponse = await axios.get(
        "/api/employee/getAllEmployees"
      );

      let allEmployees = [];

      // Response structure check करें
      if (allEmployeesResponse.data) {
        if (
          allEmployeesResponse.data.success &&
          Array.isArray(allEmployeesResponse.data.data)
        ) {
          allEmployees = allEmployeesResponse.data.data;
        } else if (Array.isArray(allEmployeesResponse.data)) {
          allEmployees = allEmployeesResponse.data;
        } else if (
          allEmployeesResponse.data.employees &&
          Array.isArray(allEmployeesResponse.data.employees)
        ) {
          allEmployees = allEmployeesResponse.data.employees;
        }
      }

      // Filter employees by role (case-insensitive)
      const normalizedRole = role.toLowerCase();
      const roleEmployees = allEmployees.filter((emp) => {
        const empRole = (
          emp.role ||
          emp.designation ||
          emp.position ||
          ""
        ).toLowerCase();
        const isRoleMatch =
          empRole.includes(normalizedRole) || normalizedRole.includes(empRole);

        // Check if employee is active
        const isActive =
          !emp.dateOfTermination &&
          !emp.terminationDate &&
          !emp.endDate &&
          (emp.status === undefined ||
            emp.status === null ||
            emp.status === "active" ||
            emp.status === "Active");

        return isRoleMatch && isActive;
      });

      setEmployeesByRole({
        [role]: roleEmployees,
      });

      console.log(
        `Role "${role}" has ${roleEmployees.length} active employees`
      );
    } catch (error) {
      console.error("Error fetching employees:", error);
      setErrorMessage("Failed to load employees. Please try again.");
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchMarketingTasks();
  }, []);

  // Handle assign button click
  const handleAssignClick = (task) => {
    setSelectedTask(task);

    // Since marketing tasks have single role, use the first role
    const role = task.depart?.[0] || "";
    if (role) {
      fetchEmployeesForRole(role);
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (task.estimatedDays || 1));

    // Pre-select if there's an existing assignment
    let selectedEmployee = null;
    if (task.assignments && task.assignments.length > 0) {
      selectedEmployee =
        task.assignments[0].employeeId?._id || task.assignments[0].employeeId;
    }

    // Pre-select client/prospect if already assigned
    const selectedClients = task.assignedClients || [];
    const selectedProspects = task.assignedProspects || [];

    setAssignForm({
      priority: task.templatePriority || "medium",
      remarks: "",
      dueDate: dueDate.toISOString().split("T")[0],
      selectedEmployee: selectedEmployee,
      selectedRole: role,
      // ✅ NEW: Client/Prospect pre-selection
      selectedClients,
      selectedProspects,
      clientRemarks: "",
      prospectRemarks: "",
    });

    setShowAssignModal(true);
  };

  // ✅ NEW: Handle Client/Prospect Selection Button Click
  const handleClientProspectSelect = () => {
    setShowClientProspectModal(true);
  };

  // ✅ NEW: Handle Client/Prospect Selection Confirm
  const handleClientProspectConfirm = (selectionData) => {
    console.log("🎯 Client/Prospect Selection Confirmed:", selectionData);

    // Update assignForm with new selections
    setAssignForm((prev) => ({
      ...prev,
      selectedClients: selectionData.clients,
      selectedProspects: selectionData.prospects,
      clientRemarks: selectionData.clientRemarks,
      prospectRemarks: selectionData.prospectRemarks,
    }));

    // Show success message
    const successMsg = `Selected ${selectionData.clients.length} client(s) and ${selectionData.prospects.length} prospect(s)`;
    setSuccessMessage(successMsg);
    setTimeout(() => setSuccessMessage(""), 3000);

    // Close the modal
    setShowClientProspectModal(false);
  };

  // Handle employee selection - SINGLE EMPLOYEE ONLY
  const handleEmployeeSelect = (employeeId) => {
    setAssignForm((prev) => ({
      ...prev,
      selectedEmployee:
        prev.selectedEmployee === employeeId ? null : employeeId,
    }));
  };

  // Handle priority change
  const handlePriorityChange = (e) => {
    setAssignForm({ ...assignForm, priority: e.target.value });
  };

  // Submit assignment - SINGLE EMPLOYEE ONLY with Client/Prospect
  const handleAssignSubmit = async () => {
    if (!selectedTask || !assignForm.selectedEmployee) {
      setErrorMessage("Please select an employee to assign");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    try {
      const confirmMessage = `Assign "${
        selectedTask.name
      }" to selected employee?
      
      ${
        assignForm.selectedClients?.length > 0
          ? `• For ${assignForm.selectedClients.length} client(s)\n`
          : ""
      }
      ${
        assignForm.selectedProspects?.length > 0
          ? `• For ${assignForm.selectedProspects.length} prospect(s)`
          : ""
      }
      
      Do you want to proceed?`;

      if (!window.confirm(confirmMessage)) {
        return;
      }

      const response = await axios.post("/api/Task/assign-marketing", {
        taskId: selectedTask._id,
        employeeId: assignForm.selectedEmployee,
        employeeRole: assignForm.selectedRole,
        priority: assignForm.priority,
        remarks: assignForm.remarks,
        dueDate: assignForm.dueDate,
        assignedBy: JSON.parse(localStorage.getItem("user")).id,
        // ✅ NEW: Send client/prospect data
        clients: assignForm.selectedClients,
        prospects: assignForm.selectedProspects,
        clientAssignmentRemarks: assignForm.clientRemarks,
        prospectAssignmentRemarks: assignForm.prospectRemarks,
      });

      if (response.data.success) {
        const successMsg = `✅ Marketing task assigned successfully! ${
          assignForm.selectedClients?.length > 0
            ? `for ${assignForm.selectedClients.length} client(s)`
            : ""
        } ${
          assignForm.selectedProspects?.length > 0
            ? `and ${assignForm.selectedProspects.length} prospect(s)`
            : ""
        }`;
        setSuccessMessage(successMsg);
        setTimeout(() => setSuccessMessage(""), 10000);
        setShowAssignModal(false);
        fetchMarketingTasks();
      } else {
        setErrorMessage("Failed to assign: " + response.data.message);
        setTimeout(() => setErrorMessage(""), 10000);
      }
    } catch (error) {
      console.error("Error assigning marketing task:", error);
      setErrorMessage(
        "Failed to assign task: " +
          (error.response?.data?.message || error.message)
      );
      setTimeout(() => setErrorMessage(""), 10000);
    }
  };

  // Sort tasks
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort tasks
  const filteredTasks = marketingTasks
    .filter((task) => {
      const matchesSearch =
        searchTerm === "" ||
        task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.sub?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "urgent" && task.templatePriority === "urgent") ||
        (filterStatus === "assigned" && task.assignments?.length > 0);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;

      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "name" || sortConfig.key === "sub") {
        aValue = aValue?.toLowerCase() || "";
        bValue = bValue?.toLowerCase() || "";
      }

      if (sortConfig.key === "estimatedDays") {
        aValue = a.estimatedDays || 0;
        bValue = b.estimatedDays || 0;
      }

      if (sortConfig.key === "templatePriority") {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        aValue = priorityOrder[a.templatePriority] || 2;
        bValue = priorityOrder[b.templatePriority] || 2;
      }

      if (sortConfig.key === "assignments") {
        aValue = a.assignments?.length || 0;
        bValue = b.assignments?.length || 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

  // Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredTasks.length / entriesPerPage);

  // Helper: Get priority badge
  const getPriorityBadge = (priority) => {
    const styles = {
      urgent: { bg: "danger", text: "white", icon: <FaExclamationCircle /> },
      high: { bg: "warning", text: "dark", icon: <FaFlag /> },
      medium: { bg: "primary", text: "white", icon: null },
      low: { bg: "secondary", text: "white", icon: null },
    };

    const style = styles[priority] || styles.medium;

    return {
      ...style,
      label: priority?.toUpperCase() || "MEDIUM",
    };
  };

  // Get assignment count for a task
  const getAssignmentCount = (task) => {
    return task.assignments?.length || 0;
  };

  // Get assigned employee name
  const getAssignedEmployeeName = (task) => {
    if (task.assignments && task.assignments.length > 0) {
      const assignment = task.assignments[0];
      return assignment.employeeId?.name || "Employee";
    }
    return null;
  };

  // Check if employee is selected
  const isEmployeeSelected = (employeeId) => {
    return assignForm.selectedEmployee === employeeId;
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setSortConfig({ key: null, direction: "asc" });
    setCurrentPage(1);
  };

  // Render sort icon
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-muted" />;
    return sortConfig.direction === "asc" ? (
      <FaSortUp className="text-primary" />
    ) : (
      <FaSortDown className="text-primary" />
    );
  };

  // ✅ Get total selected clients and prospects count
  const getTotalSelectedClientProspects = () => {
    return (
      (assignForm.selectedClients?.length || 0) +
      (assignForm.selectedProspects?.length || 0)
    );
  };

  // Get selected employee details
  const getSelectedEmployeeDetails = () => {
    if (!assignForm.selectedEmployee || !assignForm.selectedRole) return null;

    const roleEmployees = employeesByRole[assignForm.selectedRole] || [];
    return roleEmployees.find((emp) => emp._id === assignForm.selectedEmployee);
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="text-center p-5">
          <Spinner animation="border" role="status" className="text-primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <h4 className="mt-3 text-dark">Loading Marketing Tasks...</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="text-dark mb-1 fw-bold">
            <FaBullhorn className="me-2 text-primary" />
            Marketing Task Assignments
          </h3>
          <p className="text-muted mb-0">
            Assign marketing task templates to employees (Single employee per
            task)
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Badge bg="light" text="dark" className="px-3 py-2 border">
            {marketingTasks.length} Templates
          </Badge>
          <Button
            variant="outline-primary"
            onClick={fetchMarketingTasks}
            disabled={refreshing}
            className="d-flex align-items-center"
          >
            <FaSync className={`me-2 ${refreshing ? "spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="mb-4 border-light shadow-sm">
        <Card.Body className="p-3">
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0">
                  <FaSearch className="text-secondary" />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search by task name or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchTerm("")}
                    className="border-start-0"
                  >
                    <FaTimes />
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={6}>
              <div className="d-flex gap-2 justify-content-end">
                <Dropdown>
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    className="d-flex align-items-center"
                  >
                    <FaFilter className="me-2" />
                    {filterStatus === "all"
                      ? "All Templates"
                      : filterStatus === "urgent"
                      ? "Urgent"
                      : filterStatus === "assigned"
                      ? "Assigned"
                      : filterStatus}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setFilterStatus("all")}>
                      All Templates
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Header>Priority</Dropdown.Header>
                    <Dropdown.Item onClick={() => setFilterStatus("urgent")}>
                      Urgent Priority
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setFilterStatus("high")}>
                      High Priority
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setFilterStatus("medium")}>
                      Medium Priority
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => setFilterStatus("assigned")}>
                      Already Assigned
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <Dropdown>
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    className="d-flex align-items-center"
                  >
                    <FaSort className="me-2" />
                    Sort
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleSort("name")}>
                      Task Name{" "}
                      {sortConfig.key === "name" && `(${sortConfig.direction})`}
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => handleSort("templatePriority")}
                    >
                      Priority{" "}
                      {sortConfig.key === "templatePriority" &&
                        `(${sortConfig.direction})`}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSort("estimatedDays")}>
                      Timeline{" "}
                      {sortConfig.key === "estimatedDays" &&
                        `(${sortConfig.direction})`}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSort("assignments")}>
                      Assignment Count{" "}
                      {sortConfig.key === "assignments" &&
                        `(${sortConfig.direction})`}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                {(searchTerm || filterStatus !== "all") && (
                  <Button variant="outline-danger" onClick={handleClearFilters}>
                    Clear
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Messages */}
      {successMessage && (
        <Alert variant="success" className="mb-3 d-flex align-items-center">
          <FaCheckCircle className="me-2" />
          {successMessage}
          <Button
            variant="link"
            className="ms-auto p-0"
            onClick={() => setSuccessMessage("")}
          >
            <FaTimes />
          </Button>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="danger" className="mb-3 d-flex align-items-center">
          <FaExclamationCircle className="me-2" />
          {errorMessage}
          <Button
            variant="link"
            className="ms-auto p-0 text-danger"
            onClick={() => setErrorMessage("")}
          >
            <FaTimes />
          </Button>
        </Alert>
      )}

      {/* Main Table */}
      <Card className="border-light shadow-sm">
        <Card.Body className="p-0">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-5">
              <FaBullhorn size={48} className="text-muted mb-3" />
              <h5 className="text-dark mb-2">No Marketing Tasks Found</h5>
              <p className="text-muted">
                {searchTerm || filterStatus !== "all"
                  ? "No tasks match your search criteria."
                  : "No marketing task templates available."}
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th
                        className="border-0 py-3 ps-4"
                        style={{ width: "60px" }}
                      >
                        <div className="d-flex align-items-center">
                          <span className="fw-semibold">#</span>
                          <Button
                            variant="link"
                            className="p-0 ms-1"
                            onClick={() => handleSort("name")}
                          >
                            {renderSortIcon("name")}
                          </Button>
                        </div>
                      </th>
                      <th className="border-0 py-3">
                        <div className="d-flex align-items-center">
                          <span className="fw-semibold">Task Details</span>
                          <Button
                            variant="link"
                            className="p-0 ms-1"
                            onClick={() => handleSort("name")}
                          >
                            {renderSortIcon("name")}
                          </Button>
                        </div>
                      </th>
                      <th className="border-0 py-3" style={{ width: "150px" }}>
                        <div className="d-flex align-items-center">
                          <span className="fw-semibold">Required Role</span>
                        </div>
                      </th>
                      <th
                        className="border-0 py-3 text-center"
                        style={{ width: "120px" }}
                      >
                        <div className="d-flex align-items-center justify-content-center">
                          <span className="fw-semibold">Timeline</span>
                          <Button
                            variant="link"
                            className="p-0 ms-1"
                            onClick={() => handleSort("estimatedDays")}
                          >
                            {renderSortIcon("estimatedDays")}
                          </Button>
                        </div>
                      </th>
                      <th
                        className="border-0 py-3 text-center"
                        style={{ width: "120px" }}
                      >
                        <div className="d-flex align-items-center justify-content-center">
                          <span className="fw-semibold">Priority</span>
                          <Button
                            variant="link"
                            className="p-0 ms-1"
                            onClick={() => handleSort("templatePriority")}
                          >
                            {renderSortIcon("templatePriority")}
                          </Button>
                        </div>
                      </th>
                      <th
                        className="border-0 py-3 text-center"
                        style={{ width: "100px" }}
                      >
                        <span className="fw-semibold">Checklists</span>
                      </th>
                      <th
                        className="border-0 py-3 text-center"
                        style={{ width: "150px" }}
                      >
                        <span className="fw-semibold">Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTasks.map((task, index) => {
                      const priorityInfo = getPriorityBadge(
                        task.templatePriority || "medium"
                      );
                      const taskNumber = indexOfFirstEntry + index + 1;
                      const assignmentCount = getAssignmentCount(task);
                      const assignedEmployee = getAssignedEmployeeName(task);

                      return (
                        <tr key={task._id}>
                          <td className="align-middle py-3 ps-4">
                            <div className="text-dark fw-semibold">
                              {taskNumber}
                            </div>
                          </td>
                          <td className="align-middle py-3">
                            <div>
                              <h6 className="mb-1 fw-semibold text-dark">
                                {task.name}
                                {task.templatePriority === "urgent" && (
                                  <Badge bg="danger" className="ms-2 px-2 py-1">
                                    <FaExclamationCircle className="me-1" />
                                    URGENT
                                  </Badge>
                                )}
                                <Badge bg="info" className="ms-2 px-2 py-1">
                                  Marketing
                                </Badge>
                              </h6>
                              <div className="d-flex align-items-center flex-wrap gap-2">
                                <small className="text-muted">
                                  <FaBuilding className="me-1" />
                                  {task.sub}
                                </small>
                                {assignmentCount > 0 && (
                                  <small className="text-primary">
                                    <FaUserFriends className="me-1" />
                                    {assignmentCount} assigned
                                  </small>
                                )}
                                {/* ✅ Show client/prospect counts */}
                                {task.assignedClients?.length > 0 && (
                                  <small className="text-success">
                                    <FaUserCheck className="me-1" />
                                    {task.assignedClients.length} client(s)
                                  </small>
                                )}
                                {task.assignedProspects?.length > 0 && (
                                  <small className="text-info">
                                    <FaUsers className="me-1" />
                                    {task.assignedProspects.length} prospect(s)
                                  </small>
                                )}
                              </div>
                              {assignedEmployee && (
                                <small className="text-success d-block mt-1">
                                  <FaCheckCircle className="me-1" size={12} />
                                  Assigned to: {assignedEmployee}
                                </small>
                              )}
                            </div>
                          </td>
                          <td className="align-middle py-3">
                            <div className="d-flex flex-wrap gap-1">
                              {task.depart?.map((role, idx) => (
                                <Badge
                                  key={idx}
                                  bg="light"
                                  text="dark"
                                  className="px-2 py-1 border"
                                >
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="align-middle py-3 text-center">
                            <div className="d-flex align-items-center justify-content-center">
                              <FaClock className="me-2 text-secondary" />
                              <span className="fw-semibold">
                                {task.estimatedDays || 1} day
                                {task.estimatedDays !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </td>
                          <td className="align-middle py-3 text-center">
                            <Badge
                              bg={priorityInfo.bg}
                              className="px-3 py-2"
                              style={{ minWidth: "90px" }}
                            >
                              {priorityInfo.icon}
                              {priorityInfo.label}
                            </Badge>
                          </td>
                          <td className="align-middle py-3 text-center">
                            <Badge
                              bg="light"
                              text="dark"
                              className="px-3 py-2 border"
                            >
                              {task.checklists?.length || 0}
                            </Badge>
                          </td>
                          <td className="align-middle py-3 text-center">
                            <Button
                              variant={assignmentCount > 0 ? "primary" : "dark"}
                              onClick={() => handleAssignClick(task)}
                              className="d-flex align-items-center justify-content-center w-100"
                              size="sm"
                            >
                              <FaUserCheck className="me-2" />
                              {assignmentCount > 0 ? "Re-assign" : "Assign"}
                            </Button>
                            {assignmentCount > 0 && (
                              <small className="text-muted d-block mt-1">
                                Single employee task
                              </small>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                  <div className="text-muted">
                    Showing {indexOfFirstEntry + 1} to{" "}
                    {Math.min(indexOfLastEntry, filteredTasks.length)} of{" "}
                    {filteredTasks.length} entries
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
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* ✅ NEW: Client/Prospect Selection Modal */}
      <ClientProspectSelectionModal
        show={showClientProspectModal}
        onHide={() => setShowClientProspectModal(false)}
        onConfirm={handleClientProspectConfirm}
        selectedTask={selectedTask}
        initialSelections={{
          clients: assignForm.selectedClients || [],
          prospects: assignForm.selectedProspects || [],
          clientRemarks: assignForm.clientRemarks || "",
          prospectRemarks: assignForm.prospectRemarks || "",
        }}
        title={`Select Clients & Prospects for "${selectedTask?.name}"`}
      />

      {/* Assign Modal - SINGLE EMPLOYEE with Client/Prospect */}
      <Modal
        show={showAssignModal}
        onHide={() => setShowAssignModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header className="bg-light border-bottom py-3">
          <Modal.Title className="d-flex align-items-center w-100">
            <FaBullhorn className="me-3 text-primary" />
            <div className="flex-grow-1">
              <h5 className="mb-0 fw-bold">Assign Marketing Task</h5>
              <small className="text-muted">
                Select one employee to assign this marketing task
              </small>
            </div>
            <Button
              variant="link"
              onClick={() => setShowAssignModal(false)}
              className="p-0 ms-auto"
            >
              <FaTimes />
            </Button>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          {selectedTask && (
            <>
              {/* Task Info */}
              <div className="mb-4 p-3 border flex-grow-1 rounded bg-light">
                <Row className="align-items-center">
                  <Col md={8}>
                    <h5 className="mb-2 fw-bold text-dark">
                      {selectedTask.name}
                    </h5>
                    <div className="d-flex flex-wrap gap-3">
                      <div>
                        <small className="text-muted d-block">Company</small>
                        <span className="fw-semibold">{selectedTask.sub}</span>
                      </div>
                      <div>
                        <small className="text-muted d-block">Role</small>
                        <Badge bg="secondary">{assignForm.selectedRole}</Badge>
                      </div>
                      <div>
                        <small className="text-muted d-block">Days</small>
                        <span className="fw-semibold">
                          <FaClock className="me-1" />
                          {selectedTask.estimatedDays || 1}
                        </span>
                      </div>
                      <div>
                        <small className="text-muted d-block">Priority</small>
                        <Badge
                          bg={
                            getPriorityBadge(
                              selectedTask.templatePriority || "medium"
                            ).bg
                          }
                        >
                          {selectedTask.templatePriority || "medium"}
                        </Badge>
                      </div>
                      {selectedTask.assignments &&
                        selectedTask.assignments.length > 0 && (
                          <div>
                            <small className="text-muted d-block">
                              Assigned
                            </small>
                            <span className="fw-semibold text-primary">
                              <FaUserFriends className="me-1" />
                              {selectedTask.assignments.length}
                            </span>
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col md={4} className="text-end">
                    <div>
                      <small className="text-muted d-block">Due Date</small>
                      <h6 className="mb-0">
                        <FaCalendarDay className="me-2" />
                        {assignForm.dueDate}
                      </h6>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Assignment Settings */}
              <div className="mb-4">
                <h6 className="mb-3 fw-bold border-bottom pb-2">
                  Assignment Settings
                </h6>
                <Row className="g-3">
                  <Col md={6}>
                    <div>
                      <label className="form-label fw-semibold">Priority</label>
                      <Form.Select
                        value={assignForm.priority}
                        onChange={handlePriorityChange}
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent Priority</option>
                      </Form.Select>
                      <small className="text-muted">
                        Template priority:{" "}
                        {selectedTask.templatePriority || "medium"}
                      </small>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div>
                      <label className="form-label fw-semibold">Due Date</label>
                      <Form.Control
                        type="date"
                        value={assignForm.dueDate}
                        onChange={(e) =>
                          setAssignForm({
                            ...assignForm,
                            dueDate: e.target.value,
                          })
                        }
                        min={new Date().toISOString().split("T")[0]}
                      />
                      <small className="text-muted">
                        Based on {selectedTask.estimatedDays || 1} day(s)
                      </small>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* ✅ NEW: Client & Prospect Selection Section */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0 fw-bold">Client & Prospect Selection</h6>
                  <small className="text-muted">
                    {getTotalSelectedClientProspects()} selected
                  </small>
                </div>

                <Button
                  variant="outline-primary"
                  onClick={handleClientProspectSelect}
                  className="w-100 py-3 d-flex align-items-center justify-content-center"
                >
                  <FaUsers className="me-2" />
                  {getTotalSelectedClientProspects() > 0
                    ? `Edit Selection (${getTotalSelectedClientProspects()} selected)`
                    : "Select Clients & Prospects (Optional)"}
                </Button>

                {/* Show selected counts */}
                {getTotalSelectedClientProspects() > 0 && (
                  <div className="mt-3">
                    <Row>
                      {assignForm.selectedClients?.length > 0 && (
                        <Col md={6}>
                          <Alert variant="success" className="py-2">
                            <FaUserFriends className="me-2" />
                            <strong>
                              {assignForm.selectedClients.length}
                            </strong>{" "}
                            client(s) selected
                          </Alert>
                        </Col>
                      )}
                      {assignForm.selectedProspects?.length > 0 && (
                        <Col md={6}>
                          <Alert variant="info" className="py-2">
                            <FaUsers className="me-2" />
                            <strong>
                              {assignForm.selectedProspects.length}
                            </strong>{" "}
                            prospect(s) selected
                          </Alert>
                        </Col>
                      )}
                    </Row>

                    {/* Show remarks if any */}
                    {assignForm.clientRemarks && (
                      <Alert variant="light" className="mt-2">
                        <small className="text-success fw-bold">
                          Client Remarks:
                        </small>
                        <p className="mb-0">{assignForm.clientRemarks}</p>
                      </Alert>
                    )}

                    {assignForm.prospectRemarks && (
                      <Alert variant="light" className="mt-2">
                        <small className="text-info fw-bold">
                          Prospect Remarks:
                        </small>
                        <p className="mb-0">{assignForm.prospectRemarks}</p>
                      </Alert>
                    )}
                  </div>
                )}
                <small className="text-muted d-block mt-1">
                  Optional - You can select clients and/or prospects for whom
                  this marketing task is being assigned
                </small>
              </div>

              {/* Employee Selection - SINGLE EMPLOYEE */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0 fw-bold">Select Employee</h6>
                  <small className="text-muted">
                    {assignForm.selectedRole} role only
                  </small>
                </div>

                {loadingEmployees ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-2 text-muted">Loading employees...</p>
                  </div>
                ) : (
                  <Card className="border h-100">
                    <Card.Header className="bg-light border-bottom d-flex justify-content-between align-items-center py-2">
                      <div>
                        <Badge bg="dark" className="me-2">
                          {assignForm.selectedRole}
                        </Badge>
                        <small className="text-muted">
                          (
                          {
                            (employeesByRole[assignForm.selectedRole] || [])
                              .length
                          }{" "}
                          employees)
                        </small>
                      </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div
                        className="employee-list"
                        style={{
                          maxHeight: "250px",
                          overflowY: "auto",
                        }}
                      >
                        <ListGroup variant="flush">
                          {(employeesByRole[assignForm.selectedRole] || [])
                            .length === 0 ? (
                            <ListGroup.Item className="text-muted text-center py-3">
                              No active employees available for this role
                            </ListGroup.Item>
                          ) : (
                            (
                              employeesByRole[assignForm.selectedRole] || []
                            ).map((employee) => {
                              const isSelected = isEmployeeSelected(
                                employee._id
                              );
                              return (
                                <ListGroup.Item
                                  key={employee._id}
                                  className="d-flex align-items-center py-2 px-3 border-bottom"
                                  onClick={() =>
                                    handleEmployeeSelect(employee._id)
                                  }
                                  style={{
                                    cursor: "pointer",
                                    backgroundColor: isSelected
                                      ? "#f8f9fa"
                                      : "white",
                                  }}
                                >
                                  <div className="me-3">
                                    <div
                                      className={`border ${
                                        isSelected
                                          ? "bg-dark border-dark"
                                          : "border-secondary"
                                      } rounded-circle`}
                                      style={{
                                        width: "20px",
                                        height: "20px",
                                      }}
                                    >
                                      {isSelected && (
                                        <FaCheck
                                          className="text-white"
                                          style={{
                                            fontSize: "12px",
                                            margin: "2px",
                                          }}
                                        />
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex-grow-1">
                                    <div className="fw-medium">
                                      {employee.name}
                                    </div>
                                    <small className="text-muted">
                                      {employee.employeeCode} •{" "}
                                      {employee.designation || employee.role}
                                    </small>
                                  </div>
                                </ListGroup.Item>
                              );
                            })
                          )}
                        </ListGroup>
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </div>

              {/* Remarks */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Additional Instructions
                </label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Add any notes or instructions for the employee..."
                  value={assignForm.remarks}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, remarks: e.target.value })
                  }
                />
                <small className="text-muted">
                  Optional - These notes will be visible to the assigned
                  employee
                </small>
              </div>

              {/* Assignment History */}
              {selectedTask.assignments &&
                selectedTask.assignments.length > 0 && (
                  <Alert variant="light" className="border mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <FaHistory className="me-2 text-info" />
                      <h6 className="mb-0">Previous Assignments</h6>
                      <Badge bg="info" className="ms-2">
                        {selectedTask.assignments.length}
                      </Badge>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      {selectedTask.assignments.map((assignment, idx) => (
                        <div key={idx} className="mb-2">
                          <small className="text-muted">
                            {new Date(
                              assignment.assignedAt
                            ).toLocaleDateString()}{" "}
                            - {assignment.employeeId?.name || "Employee"}
                          </small>
                        </div>
                      ))}
                    </div>
                  </Alert>
                )}

              {/* Selected Employee Summary */}
              {assignForm.selectedEmployee && (
                <Alert variant="light" className="border">
                  <div className="d-flex align-items-center mb-2">
                    <FaCheckCircle className="me-2 text-success" />
                    <h6 className="mb-0">Selected Employee</h6>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="fw-medium">
                          {getSelectedEmployeeDetails()?.name || "Employee"}
                        </span>
                        <div>
                          <small className="text-muted">
                            Role: {assignForm.selectedRole}
                          </small>
                        </div>
                      </div>
                      <Badge bg="dark">Selected</Badge>
                    </div>
                  </div>
                </Alert>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="bg-light border-top">
          <Button
            variant="outline-secondary"
            onClick={() => setShowAssignModal(false)}
            className="border"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAssignSubmit}
            disabled={!assignForm.selectedEmployee}
            className="fw-semibold"
          >
            <FaPaperPlane className="me-2" />
            {assignForm.selectedEmployee
              ? `Assign to Selected Employee`
              : "Select Employee First"}
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx global>{`
        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .employee-list::-webkit-scrollbar {
          width: 6px;
        }

        .employee-list::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .employee-list::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }

        .employee-list::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default MarketingAssignments;
