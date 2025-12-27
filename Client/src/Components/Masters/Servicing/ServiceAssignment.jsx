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
  FaTools,
} from "react-icons/fa";

const ServiceAssignments = () => {
  const [serviceTasks, setServiceTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [employeesByRole, setEmployeesByRole] = useState({});
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Assign Form State - SINGLE EMPLOYEE ONLY
  const [assignForm, setAssignForm] = useState({
    priority: "medium",
    remarks: "",
    dueDate: "",
    selectedEmployee: null,
    selectedRole: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch service tasks - सिर्फ TEMPLATE status वाले
  const fetchServiceTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "/api/Task?type=service&status=template"
      );
      setServiceTasks(response.data?.tasks || []);
    } catch (error) {
      console.error("Error fetching service tasks:", error);
      alert("Failed to fetch service tasks: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees for selected role
  const fetchEmployeesForRole = async (role) => {
    setLoadingEmployees(true);
    try {
      const response = await axios.get(
        `/api/employee/getAllEmployees?role=${role}`
      );
      if (response.data.success) {
        setEmployeesByRole({
          [role]: response.data.data.filter((emp) => !emp.dateOfTermination),
        });
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Failed to fetch employees: " + error.message);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchServiceTasks();
  }, []);

  // Handle assign button click
  const handleAssignClick = (task) => {
    setSelectedTask(task);

    // Since service tasks have single role, use the first role
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

    setAssignForm({
      priority: task.templatePriority || "medium",
      remarks: "",
      dueDate: dueDate.toISOString().split("T")[0],
      selectedEmployee: selectedEmployee,
      selectedRole: role,
    });

    setShowAssignModal(true);
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

  // Submit assignment - SINGLE EMPLOYEE ONLY
  const handleAssignSubmit = async () => {
    if (!selectedTask || !assignForm.selectedEmployee) {
      alert("Please select an employee to assign");
      return;
    }

    try {
      const confirmMessage = `Assign "${selectedTask.name}" to selected employee?`;

      if (!window.confirm(confirmMessage)) {
        return;
      }

      const response = await axios.post("/api/Task/assign-service", {
        taskId: selectedTask._id,
        employeeId: assignForm.selectedEmployee,
        employeeRole: assignForm.selectedRole,
        priority: assignForm.priority,
        remarks: assignForm.remarks,
        dueDate: assignForm.dueDate,
        assignedBy: JSON.parse(localStorage.getItem("user")).id,
      });

      if (response.data.success) {
        alert(`✅ Service task assigned successfully!`);
        setShowAssignModal(false);
        fetchServiceTasks(); // Refresh list
      } else {
        alert("Failed to assign: " + response.data.message);
      }
    } catch (error) {
      console.error("Error assigning service task:", error);
      alert(
        "Failed to assign task: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // Filter tasks
  const filteredTasks = serviceTasks.filter((task) => {
    const matchesSearch =
      searchTerm === "" ||
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.sub.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "urgent" && task.templatePriority === "urgent");

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredTasks.length / entriesPerPage);

  // Helper: Get priority badge
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "urgent":
        return {
          bg: "danger",
          text: "white",
          icon: <FaExclamationCircle className="me-1" />,
          label: "URGENT",
        };
      case "high":
        return {
          bg: "warning",
          text: "dark",
          icon: <FaFlag className="me-1" />,
          label: "HIGH",
        };
      case "medium":
        return {
          bg: "primary",
          text: "white",
          icon: null,
          label: "MEDIUM",
        };
      case "low":
        return {
          bg: "secondary",
          text: "white",
          icon: null,
          label: "LOW",
        };
      default:
        return {
          bg: "primary",
          text: "white",
          icon: null,
          label: "MEDIUM",
        };
    }
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

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center p-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="mt-3 text-dark">Loading Service Tasks...</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="text-dark mb-1">
            <FaTools className="me-2" />
            Service Task Assignments
          </h3>
          <p className="text-muted mb-0">
            Assign service task templates to employees (Single employee per
            task)
          </p>
        </div>
        <div className="d-flex align-items-center">
          <Badge bg="dark" className="px-3 py-2 me-3">
            {serviceTasks.length} Templates
          </Badge>
          <Button variant="dark" onClick={fetchServiceTasks}>
            <FaEye className="me-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="mb-3 border">
        <Card.Body className="p-3">
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0">
                  <FaSearch />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search by task name or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <div className="d-flex gap-2 justify-content-end">
                <Dropdown>
                  <Dropdown.Toggle
                    variant="outline-dark"
                    className="d-flex align-items-center"
                  >
                    <FaFilter className="me-2" />
                    {filterStatus === "all"
                      ? "All Templates"
                      : filterStatus === "urgent"
                      ? "Urgent"
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
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Main Table */}
      <Card className="border">
        <Card.Body className="p-0">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-5">
              <FaUsers size={48} className="text-muted mb-3" />
              <h5 className="text-dark mb-2">No Service Tasks Found</h5>
              <p className="text-muted">
                Create service task templates first to assign them to employees.
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table bordered hover className="mb-0">
                  <thead style={{ backgroundColor: "#f8f9fa" }}>
                    <tr>
                      <th
                        className="border text-center"
                        style={{ width: "50px" }}
                      >
                        #
                      </th>
                      <th className="border">Task Details</th>
                      <th className="border" style={{ width: "120px" }}>
                        Required Role
                      </th>
                      <th
                        className="border text-center"
                        style={{ width: "120px" }}
                      >
                        Timeline
                      </th>
                      <th
                        className="border text-center"
                        style={{ width: "120px" }}
                      >
                        Priority
                      </th>
                      <th
                        className="border text-center"
                        style={{ width: "100px" }}
                      >
                        Checklists
                      </th>
                      <th
                        className="border text-center"
                        style={{ width: "150px" }}
                      >
                        Action
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
                          <td className="border text-center align-middle">
                            <div className="text-dark fw-semibold">
                              {taskNumber}
                            </div>
                          </td>
                          <td className="border align-middle">
                            <div>
                              <h6 className="text-dark mb-1 fw-semibold">
                                {task.name}
                              </h6>
                              <div className="d-flex align-items-center">
                                <small className="text-muted me-3">
                                  <strong>Company:</strong> {task.sub}
                                </small>
                                <Badge
                                  bg="light"
                                  text="dark"
                                  className="px-2 py-1"
                                >
                                  Service
                                </Badge>
                                {assignmentCount > 0 && (
                                  <Badge bg="info" className="ms-2 px-2 py-1">
                                    <FaUserFriends size={10} className="me-1" />
                                    {assignmentCount} assigned
                                  </Badge>
                                )}
                              </div>
                              {assignedEmployee && (
                                <small className="text-success d-block mt-1">
                                  <FaCheckCircle size={12} className="me-1" />
                                  Assigned to: {assignedEmployee}
                                </small>
                              )}
                            </div>
                          </td>
                          <td className="border align-middle">
                            <div className="d-flex flex-wrap gap-1">
                              {task.depart?.map((role, idx) => (
                                <Badge
                                  key={idx}
                                  bg="secondary"
                                  className="px-2 py-1"
                                >
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="border align-middle text-center">
                            <div className="d-flex align-items-center justify-content-center">
                              <FaClock className="me-2 text-dark" />
                              <span className="text-dark fw-semibold">
                                {task.estimatedDays || 1} day
                                {task.estimatedDays !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </td>
                          <td className="border align-middle text-center">
                            <Badge
                              bg={priorityInfo.bg}
                              className="px-3 py-1"
                              style={{ minWidth: "90px" }}
                            >
                              {priorityInfo.icon}
                              {priorityInfo.label}
                            </Badge>
                          </td>
                          <td className="border align-middle text-center">
                            <Badge bg="light" text="dark" className="px-3 py-1">
                              {task.checklists?.length || 0}
                            </Badge>
                          </td>
                          <td className="border align-middle text-center">
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

      {/* Assign Modal - SINGLE EMPLOYEE */}
      <Modal
        show={showAssignModal}
        onHide={() => setShowAssignModal(false)}
        size="md"
        centered
        backdrop="static"
      >
        <Modal.Header className="bg-dark text-white">
          <Modal.Title className="d-flex align-items-center">
            <FaTools className="me-3" />
            <div>
              <h5 className="mb-0">Assign Service Task</h5>
              <small className="opacity-75">
                Select one employee to assign this service task
              </small>
            </div>
          </Modal.Title>
          <Button
            variant="outline-light"
            size="sm"
            onClick={() => setShowAssignModal(false)}
            className="border-0"
          >
            <FaTimes />
          </Button>
        </Modal.Header>

        <Modal.Body className="p-4">
          {selectedTask && (
            <>
              {/* Task Info */}
              <div className="mb-4 p-3 border rounded bg-light">
                <h5 className="text-dark mb-2">{selectedTask.name}</h5>
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
                </div>
              </div>

              {/* Assignment Settings */}
              <div className="mb-4">
                <h6 className="text-dark mb-3 border-bottom pb-2">
                  <FaStar className="me-2" />
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
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Employee Selection - SINGLE EMPLOYEE */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="text-dark mb-0">
                    <FaUserFriends className="me-2" />
                    Select Employee
                  </h6>
                  <small className="text-muted">
                    {assignForm.selectedRole} role only
                  </small>
                </div>

                {loadingEmployees ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-dark" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading employees...</p>
                  </div>
                ) : (
                  <div className="employee-list border rounded">
                    <ListGroup variant="flush">
                      {(employeesByRole[assignForm.selectedRole] || []).map(
                        (employee) => {
                          const isSelected =
                            assignForm.selectedEmployee === employee._id;
                          return (
                            <ListGroup.Item
                              key={employee._id}
                              className="d-flex align-items-center py-3 px-3"
                              onClick={() => handleEmployeeSelect(employee._id)}
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
                                  } rounded-circle d-flex align-items-center justify-content-center`}
                                  style={{
                                    width: "24px",
                                    height: "24px",
                                  }}
                                >
                                  {isSelected && (
                                    <FaCheck
                                      className="text-white"
                                      style={{
                                        fontSize: "14px",
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                              <div className="flex-grow-1">
                                <div className="fw-medium">{employee.name}</div>
                                <small className="text-muted">
                                  {employee.employeeCode} •{" "}
                                  {employee.designation}
                                </small>
                              </div>
                            </ListGroup.Item>
                          );
                        }
                      )}
                    </ListGroup>
                  </div>
                )}
              </div>

              {/* Remarks */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <FaList className="me-2" />
                  Additional Instructions
                </label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Add notes for the assigned employee..."
                  value={assignForm.remarks}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, remarks: e.target.value })
                  }
                />
              </div>

              {/* Assignment History */}
              {selectedTask.assignments &&
                selectedTask.assignments.length > 0 && (
                  <Alert variant="light" className="border">
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
                            -{assignment.employeeId?.name || "Employee"}
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
                          {
                            (
                              employeesByRole[assignForm.selectedRole] || []
                            ).find(
                              (emp) => emp._id === assignForm.selectedEmployee
                            )?.name
                          }
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
            variant="outline-dark"
            onClick={() => setShowAssignModal(false)}
            className="border px-4"
          >
            Cancel
          </Button>
          <Button
            variant="dark"
            onClick={handleAssignSubmit}
            disabled={!assignForm.selectedEmployee}
            className="px-4 fw-semibold"
          >
            <FaPaperPlane className="me-2" />
            {assignForm.selectedEmployee
              ? `Assign to Selected Employee`
              : `Select Employee First`}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ServiceAssignments;
