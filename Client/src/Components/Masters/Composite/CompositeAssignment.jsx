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
  FaCalendarAlt,
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
  FaUserPlus,
  FaTimes,
  FaEye,
  FaEdit,
  FaTrash,
  FaHistory,
  FaBuilding,
  FaListAlt,
  FaUserTie,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSync,
} from "react-icons/fa";

const CompositeAssignments = () => {
  const [compositeTasks, setCompositeTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [employeesByRole, setEmployeesByRole] = useState({});
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Assign Form State
  const [assignForm, setAssignForm] = useState({
    priority: "medium",
    remarks: "",
    dueDate: "",
    selectedEmployees: {},
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch composite tasks - सिर्फ TEMPLATE status वाले
  const fetchCompositeTasks = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await axios.get(
        "/api/Task?type=composite&status=template"
      );
      const tasks = response.data?.tasks || response.data || [];
      setCompositeTasks(tasks);
    } catch (error) {
      console.error("Error fetching composite tasks:", error);
      setErrorMessage("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch employees by role - EmployeeList वाला ही API use करें
  const fetchEmployeesByRole = async (roles) => {
    setLoadingEmployees(true);
    try {
      const employeesMap = {};

      // सभी employees एक बार में fetch करें
      const allEmployeesResponse = await axios.get(
        "/api/employee/getAllEmployees"
      );

      let allEmployees = [];

      // Response structure check करें
      if (allEmployeesResponse.data) {
        // Structure 1: { success: true, data: [...] }
        if (
          allEmployeesResponse.data.success &&
          Array.isArray(allEmployeesResponse.data.data)
        ) {
          allEmployees = allEmployeesResponse.data.data;
        }
        // Structure 2: Direct array
        else if (Array.isArray(allEmployeesResponse.data)) {
          allEmployees = allEmployeesResponse.data;
        }
        // Structure 3: { employees: [...] }
        else if (
          allEmployeesResponse.data.employees &&
          Array.isArray(allEmployeesResponse.data.employees)
        ) {
          allEmployees = allEmployeesResponse.data.employees;
        }
      }

      console.log(`Total employees fetched: ${allEmployees.length}`);

      // हर role के लिए employees filter करें
      roles.forEach((role) => {
        // Case-insensitive role match
        const normalizedRole = role.toLowerCase();

        const roleEmployees = allEmployees.filter((emp) => {
          // Check multiple possible role fields
          const empRole = (
            emp.role ||
            emp.designation ||
            emp.position ||
            ""
          ).toLowerCase();
          const isRoleMatch =
            empRole.includes(normalizedRole) ||
            normalizedRole.includes(empRole);

          // Check if employee is active (not terminated)
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

        employeesMap[role] = roleEmployees;
        console.log(
          `Role "${role}" has ${roleEmployees.length} active employees`
        );
      });

      setEmployeesByRole(employeesMap);
    } catch (error) {
      console.error("Error in fetchEmployeesByRole:", error);
      setErrorMessage("Failed to load employees. Please try again.");
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchCompositeTasks();
  }, []);

  // Handle assign button click
  const handleAssignClick = (task) => {
    setSelectedTask(task);

    if (task.depart && task.depart.length > 0) {
      fetchEmployeesByRole(task.depart);
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (task.estimatedDays || 1));

    // Existing assignments को pre-select करें
    const existingSelections = {};
    if (task.assignments && task.assignments.length > 0) {
      task.assignments.forEach((assignment) => {
        if (assignment.employeeId && assignment.employeeRole) {
          const role = assignment.employeeRole;
          if (!existingSelections[role]) {
            existingSelections[role] = assignment.employeeId;
          } else {
            existingSelections[role] = existingSelections[role]
              ? `${existingSelections[role]},${assignment.employeeId}`
              : assignment.employeeId;
          }
        }
      });
    }

    setAssignForm({
      priority: task.templatePriority || "medium",
      remarks: "",
      dueDate: dueDate.toISOString().split("T")[0],
      selectedEmployees: existingSelections,
    });

    setShowAssignModal(true);
  };

  // Handle employee selection
  const handleEmployeeSelect = (role, employeeId) => {
    setAssignForm((prev) => {
      const current = prev.selectedEmployees[role] || "";

      // FIX: Check if current is a string before calling includes
      if (typeof current === "string" && current.includes(employeeId)) {
        const updated = current
          .split(",")
          .filter((id) => id !== employeeId)
          .join(",");
        const newSelected = { ...prev.selectedEmployees };

        if (updated === "") {
          delete newSelected[role];
        } else {
          newSelected[role] = updated;
        }

        return {
          ...prev,
          selectedEmployees: newSelected,
        };
      } else {
        const newValue = current ? `${current},${employeeId}` : employeeId;
        return {
          ...prev,
          selectedEmployees: {
            ...prev.selectedEmployees,
            [role]: newValue,
          },
        };
      }
    });
  };

  // Select ALL employees for a role
  const handleSelectAllForRole = (role) => {
    const allEmployees = employeesByRole[role] || [];
    if (allEmployees.length === 0) return;

    const allEmployeeIds = allEmployees.map((emp) => emp._id).join(",");

    setAssignForm((prev) => ({
      ...prev,
      selectedEmployees: {
        ...prev.selectedEmployees,
        [role]: allEmployeeIds,
      },
    }));
  };

  // Clear selection for a role
  const handleClearSelectionForRole = (role) => {
    setAssignForm((prev) => {
      const newSelected = { ...prev.selectedEmployees };
      delete newSelected[role];
      return {
        ...prev,
        selectedEmployees: newSelected,
      };
    });
  };

  // Handle priority change
  const handlePriorityChange = (e) => {
    setAssignForm({ ...assignForm, priority: e.target.value });
  };

  // Submit assignment
  const handleAssignSubmit = async () => {
    if (!selectedTask) return;

    try {
      const assignments = [];

      Object.entries(assignForm.selectedEmployees).forEach(
        ([role, employeeValue]) => {
          // FIX: Check if employeeValue exists and is a string
          if (employeeValue) {
            const employeeIds =
              typeof employeeValue === "string"
                ? employeeValue.split(",").filter((id) => id.trim())
                : [String(employeeValue)].filter((id) => id.trim());

            employeeIds.forEach((employeeId) => {
              if (employeeId.trim()) {
                assignments.push({
                  employeeId: employeeId.trim(),
                  employeeRole: role,
                  priority: assignForm.priority,
                  remarks: assignForm.remarks,
                  dueDate: assignForm.dueDate,
                });
              }
            });
          }
        }
      );

      if (assignments.length === 0) {
        setErrorMessage("Please select at least one employee to assign");
        setTimeout(() => setErrorMessage(""), 3000);
        return;
      }

      const confirmMessage = `Assign "${selectedTask.name}" to ${assignments.length} employee(s)?\n\nThis will add to existing assignments.`;

      if (!window.confirm(confirmMessage)) {
        return;
      }

      const response = await axios.post("/api/Task/assign-composite", {
        taskId: selectedTask._id,
        assignments,
        assignedBy: JSON.parse(localStorage.getItem("user")).id,
      });

      if (response.data.success) {
        setSuccessMessage(
          `Task assigned to ${assignments.length} employee(s)!`
        );
        setTimeout(() => setSuccessMessage(""), 3000);
        setShowAssignModal(false);
        fetchCompositeTasks();
      }
    } catch (error) {
      console.error("Error assigning task:", error);
      setErrorMessage("Failed to assign task: " + error.message);
      setTimeout(() => setErrorMessage(""), 3000);
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
  const filteredTasks = compositeTasks
    .filter((task) => {
      const matchesSearch =
        searchTerm === "" ||
        task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.sub?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "urgent" && task.templatePriority === "urgent") ||
        (filterStatus === "multi-role" && task.depart?.length > 1);

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

      if (sortConfig.key === "depart") {
        aValue = a.depart?.length || 0;
        bValue = b.depart?.length || 0;
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

  // Check if all employees are selected for a role
  const isAllSelectedForRole = (role) => {
    const selected = assignForm.selectedEmployees[role];
    const allEmployees = employeesByRole[role] || [];

    if (!selected || allEmployees.length === 0) return false;

    // FIX: Check if selected is a string
    if (typeof selected === "string" && selected.includes(",")) {
      const selectedIds = selected.split(",").map((id) => id.trim());
      return selectedIds.length === allEmployees.length;
    }

    return false;
  };

  // Check if employee is selected
  const isEmployeeSelected = (role, employeeId) => {
    const selected = assignForm.selectedEmployees[role];
    if (!selected) return false;

    // FIX: Handle both string and other types
    if (typeof selected === "string" && selected.includes(",")) {
      return selected
        .split(",")
        .map((id) => id.trim())
        .includes(employeeId);
    }

    return String(selected) === String(employeeId);
  };

  // Get assignment count for a task
  const getAssignmentCount = (task) => {
    return task.assignments ? task.assignments.length : 0;
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

  // Helper function to safely get employee value count
  const getEmployeeValueCount = (employeeValue) => {
    if (!employeeValue) return 0;

    if (typeof employeeValue === "string" && employeeValue.includes(",")) {
      return employeeValue.split(",").filter((id) => id.trim()).length;
    }

    return 1;
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="text-center p-5">
          <Spinner animation="border" role="status" className="text-primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <h4 className="mt-3 text-dark">Loading Tasks...</h4>
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
            <FaUserCheck className="me-2 text-primary" />
            Composite Task Assignments
          </h3>
          <p className="text-muted mb-0">
            Assign composite task templates to employees
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Badge bg="light" text="dark" className="px-3 py-2 border">
            {compositeTasks.length} Templates
          </Badge>
          <Button
            variant="outline-primary"
            onClick={fetchCompositeTasks}
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
                      : filterStatus === "multi-role"
                      ? "Multi-Role"
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
                    <Dropdown.Item
                      onClick={() => setFilterStatus("multi-role")}
                    >
                      Multi-Role Templates
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
                    <Dropdown.Item onClick={() => handleSort("depart")}>
                      Roles{" "}
                      {sortConfig.key === "depart" &&
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
              <FaUsers size={48} className="text-muted mb-3" />
              <h5 className="text-dark mb-2">No Tasks Found</h5>
              <p className="text-muted">
                {searchTerm || filterStatus !== "all"
                  ? "No tasks match your search criteria."
                  : "No composite task templates available."}
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
                      <th className="border-0 py-3" style={{ width: "200px" }}>
                        <div className="d-flex align-items-center">
                          <span className="fw-semibold">Required Roles</span>
                          <Button
                            variant="link"
                            className="p-0 ms-1"
                            onClick={() => handleSort("depart")}
                          >
                            {renderSortIcon("depart")}
                          </Button>
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
                              </div>
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
                              {assignmentCount > 0 ? "Assign More" : "Assign"}
                            </Button>
                            {assignmentCount > 0 && (
                              <small className="text-muted d-block mt-1">
                                {assignmentCount} assigned
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

      {/* Assign Modal */}
      <Modal
        show={showAssignModal}
        onHide={() => setShowAssignModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header className="bg-light border-bottom py-3">
          <Modal.Title className="d-flex align-items-center w-100">
            <FaUserCheck className="me-3 text-primary" />
            <div className="flex-grow-1">
              <h5 className="mb-0 fw-bold">Assign Task to Employees</h5>
              <small className="text-muted">
                Select employees to assign this composite task
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

              {/* Employee Selection */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0 fw-bold">Select Employees by Role</h6>
                  <small className="text-muted">
                    {Object.keys(assignForm.selectedEmployees).length} role(s)
                    selected
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
                  <div className="row g-3">
                    {selectedTask.depart?.map((role, index) => {
                      const roleEmployees = employeesByRole[role] || [];
                      const isAllSelected = isAllSelectedForRole(role);

                      return (
                        <Col md={6} key={index}>
                          <Card className="border h-100">
                            <Card.Header className="bg-light border-bottom d-flex justify-content-between align-items-center py-2">
                              <div>
                                <Badge bg="dark" className="me-2">
                                  {role}
                                </Badge>
                                <small className="text-muted">
                                  ({roleEmployees.length} employees)
                                </small>
                              </div>
                              <div className="d-flex gap-1">
                                {!isAllSelected && roleEmployees.length > 0 && (
                                  <Button
                                    variant="outline-dark"
                                    size="sm"
                                    onClick={() => handleSelectAllForRole(role)}
                                    className="border"
                                  >
                                    <FaCheck className="me-1" /> All
                                  </Button>
                                )}
                                {assignForm.selectedEmployees[role] && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() =>
                                      handleClearSelectionForRole(role)
                                    }
                                    className="border"
                                  >
                                    Clear
                                  </Button>
                                )}
                              </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                              <div
                                className="employee-list"
                                style={{
                                  maxHeight: "200px",
                                  overflowY: "auto",
                                }}
                              >
                                <ListGroup variant="flush">
                                  {roleEmployees.length === 0 ? (
                                    <ListGroup.Item className="text-muted text-center py-3">
                                      No active employees available for this
                                      role
                                    </ListGroup.Item>
                                  ) : (
                                    roleEmployees.map((employee) => {
                                      const isSelected = isEmployeeSelected(
                                        role,
                                        employee._id
                                      );
                                      return (
                                        <ListGroup.Item
                                          key={employee._id}
                                          className="d-flex align-items-center py-2 px-3 border-bottom"
                                          onClick={() =>
                                            handleEmployeeSelect(
                                              role,
                                              employee._id
                                            )
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
                                              {employee.designation ||
                                                employee.role}
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
                        </Col>
                      );
                    })}
                  </div>
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
                  placeholder="Add any notes or instructions for employees..."
                  value={assignForm.remarks}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, remarks: e.target.value })
                  }
                />
                <small className="text-muted">
                  Optional - These notes will be visible to assigned employees
                </small>
              </div>

              {/* Selected Employees Summary */}
              {Object.keys(assignForm.selectedEmployees).length > 0 && (
                <Alert variant="light" className="border">
                  <div className="d-flex align-items-center mb-2">
                    <FaCheckCircle className="me-2 text-success" />
                    <h6 className="mb-0">Selected Employees</h6>
                  </div>

                  <div className="row g-2">
                    {Object.entries(assignForm.selectedEmployees).map(
                      ([role, employeeValue]) => {
                        const selectedCount =
                          getEmployeeValueCount(employeeValue);

                        return (
                          <div key={role} className="col-md-6">
                            <div className="bg-white p-2 rounded border">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-medium">{role}</span>
                                <Badge bg="dark">
                                  {selectedCount} selected
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-top">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="fw-bold">
                          Total New Assignments:{" "}
                          {Object.values(assignForm.selectedEmployees).reduce(
                            (total, val) => total + getEmployeeValueCount(val),
                            0
                          )}{" "}
                          employee(s)
                        </span>
                      </div>
                      <div className="text-end">
                        <small className="text-muted">
                          Priority: {assignForm.priority} • Due:{" "}
                          {assignForm.dueDate}
                        </small>
                      </div>
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
            disabled={Object.keys(assignForm.selectedEmployees).length === 0}
            className="fw-semibold"
          >
            <FaPaperPlane className="me-2" />
            {Object.keys(assignForm.selectedEmployees).length === 0
              ? "Select Employees First"
              : `Assign to ${Object.values(assignForm.selectedEmployees).reduce(
                  (total, val) => total + getEmployeeValueCount(val),
                  0
                )} Employee(s)`}
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

export default CompositeAssignments;
