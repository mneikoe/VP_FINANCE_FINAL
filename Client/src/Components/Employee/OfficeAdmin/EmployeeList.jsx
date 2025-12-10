import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Container,
  Spinner,
  Alert,
  Card,
  Badge,
  InputGroup,
  FormControl,
  Tabs,
  Tab,
  Row,
  Col,
  Dropdown,
  Form,
  Pagination,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../config/axios";
import {
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiTrash2,
  FiEdit,
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar,
  FiBriefcase,
  FiMoreVertical,
  FiFilter,
  FiDownload,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import {
  FaUserTie,
  FaPhoneAlt,
  FaEnvelope,
  FaUserCheck,
  FaUserClock,
  FaUserGraduate,
  FaIdCard,
  FaBuilding,
  FaMapMarkerAlt,
} from "react-icons/fa";

const EmployeeList = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("telecaller");
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // ✅ HR Sidebar inspired colors and design
  const roleConfig = {
    telecaller: {
      name: "Telecaller",
      icon: "📞",
      color: "#0dcaf0",
      bgColor: "#e3f2fd",
      borderColor: "#0dcaf0",
      description: "Customer calling and support team",
    },
    hr: {
      name: "HR",
      icon: "💼",
      color: "#ffc107",
      bgColor: "#fff3cd",
      borderColor: "#ffc107",
      description: "Human Resource management",
    },
    rm: {
      name: "Relationship Manager",
      icon: "👔",
      color: "#0d6efd",
      bgColor: "#e7f1ff",
      borderColor: "#0d6efd",
      description: "Client relationship and business development",
    },
    telemarketer: {
      name: "Telemarketer",
      icon: "📱",
      color: "#198754",
      bgColor: "#d1e7dd",
      borderColor: "#198754",
      description: "Marketing and sales professionals",
    },
    oe: {
      name: "Operations Executive",
      icon: "🔧",
      color: "#6c757d",
      bgColor: "#e2e3e5",
      borderColor: "#6c757d",
      description: "Operations and process management",
    },
    oa: {
      name: "Office Admin",
      icon: "📋",
      color: "#212529",
      bgColor: "#d3d3d3",
      borderColor: "#212529",
      description: "Administrative and office management",
    },
  };

  const fetchEmployeesByRole = async (role) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🔄 Fetching ${role} employees...`);

      let responseData = [];

      switch (role) {
        case "telecaller":
          const telecallerResponse = await axiosInstance.get("/api/telecaller");
          if (telecallerResponse.data?.telecallers) {
            responseData = telecallerResponse.data.telecallers.map((tc) => ({
              _id: tc._id,
              name: tc.username,
              employeeCode: tc.employeeCode || `TC-${tc._id?.slice(-4)}`,
              emailId: tc.email,
              mobileNo: tc.mobileno,
              role: "Telecaller",
              designation: tc.designation || "Telecaller",
              dateOfJoining: tc.dateOfJoining || tc.createdAt,
              source: "telecaller",
              status: tc.dateOfTermination ? "inactive" : "active",
              department: "Customer Support",
            }));
          }
          break;

        case "hr":
          const hrResponse = await axiosInstance.get("/api/hr");
          if (hrResponse.data?.HRs) {
            responseData = hrResponse.data.HRs.map((hr) => ({
              _id: hr._id,
              name: hr.username,
              employeeCode: hr.employeeCode || `HR-${hr._id?.slice(-4)}`,
              emailId: hr.email,
              mobileNo: hr.mobileno,
              role: "HR",
              designation: hr.designation || "HR Manager",
              dateOfJoining: hr.dateOfJoining || hr.createdAt,
              source: "hr",
              status: hr.dateOfTermination ? "inactive" : "active",
              department: "Human Resources",
            }));
          }
          break;

        default:
          const employeeResponse = await axiosInstance.get(
            "/api/employee/getAllEmployees"
          );
          if (employeeResponse.data?.success && employeeResponse.data.data) {
            const filteredEmployees = employeeResponse.data.data.filter(
              (emp) => emp.role && emp.role.toLowerCase() === role.toLowerCase()
            );

            responseData = filteredEmployees.map((emp) => ({
              _id: emp._id,
              name: emp.name,
              employeeCode:
                emp.employeeCode ||
                `${role.toUpperCase()}-${emp._id?.slice(-4)}`,
              emailId: emp.emailId,
              mobileNo: emp.mobileNo,
              role: emp.role || roleConfig[role]?.name || role,
              designation: emp.designation || roleConfig[role]?.name || role,
              dateOfJoining: emp.dateOfJoining || emp.createdAt,
              source: "employee",
              status: emp.dateOfTermination ? "inactive" : "active",
              department: roleConfig[role]?.name || "General",
              presentAddress: emp.presentAddress,
              emergencyContact: emp.emergencyContactMobile,
              salary: emp.salaryOnJoining,
            }));
          }
      }

      setEmployees(responseData);
      setCurrentPage(1);
    } catch (err) {
      console.error(`❌ ${role} API Error:`, err);
      setError(
        err.response?.data?.message || `Error fetching ${role} employees`
      );
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesByRole(activeTab);
  }, [activeTab]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedEmployees = React.useMemo(() => {
    let sortableItems = [...employees];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [employees, sortConfig]);

  const filteredEmployees = sortedEmployees.filter(
    (employee) =>
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.emailId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.designation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handleViewDetails = (employee) => {
    navigate(`/employee/${employee._id}`, {
      state: {
        employeeData: employee,
        source: employee.source,
      },
    });
  };

  const handleEdit = (employee) => {
    navigate(`/edit-employee/${employee._id}`, {
      state: { employeeData: employee },
    });
  };

  const handleDelete = async (employeeId, employeeName) => {
    if (window.confirm(`Are you sure you want to delete ${employeeName}?`)) {
      setDeleteLoading(employeeId);
      try {
        const employee = employees.find((emp) => emp._id === employeeId);
        if (employee.source === "hr") {
          await axiosInstance.delete(`/api/hr/${employeeId}`);
        } else if (employee.source === "telecaller") {
          await axiosInstance.delete(`/api/telecaller/${employeeId}`);
        } else {
          await axiosInstance.delete(
            `/api/employee/deleteEmployee?employeeId=${employeeId}`
          );
        }

        alert("Employee deleted successfully!");
        fetchEmployeesByRole(activeTab);
      } catch (err) {
        alert(`Error deleting employee: ${err.message}`);
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const getExperience = (dateOfJoining) => {
    if (!dateOfJoining) return "N/A";
    const joinDate = new Date(dateOfJoining);
    const today = new Date();
    const diffTime = Math.abs(today - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return "Less than 1 month";
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  const getStatusBadge = (employee) => {
    if (employee.status === "inactive")
      return {
        text: "Inactive",
        variant: "danger",
        icon: <FaUserClock className="me-1" />,
        color: "#dc3545",
        bgColor: "#f8d7da",
      };

    if (!employee.dateOfJoining)
      return {
        text: "Not Joined",
        variant: "secondary",
        icon: <FaUser className="me-1" />,
        color: "#6c757d",
        bgColor: "#e2e3e5",
      };

    const joinDate = new Date(employee.dateOfJoining);
    const today = new Date();
    const diffDays = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24));

    if (diffDays < 30)
      return {
        text: "New",
        variant: "success",
        icon: <FaUserCheck className="me-1" />,
        color: "#198754",
        bgColor: "#d1e7dd",
      };
    if (diffDays < 180)
      return {
        text: "Active",
        variant: "primary",
        icon: <FaUserCheck className="me-1" />,
        color: "#0d6efd",
        bgColor: "#cfe2ff",
      };
    return {
      text: "Experienced",
      variant: "info",
      icon: <FaUserGraduate className="me-1" />,
      color: "#0dcaf0",
      bgColor: "#d1ecf1",
    };
  };

  if (loading) {
    return (
      <Container fluid className="py-4" style={{ backgroundColor: "#f8f9fa" }}>
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ minHeight: "60vh" }}
        >
          <Spinner
            animation="border"
            style={{
              width: "3rem",
              height: "3rem",
              borderWidth: "3px",
              borderColor: "#0d6efd transparent #0d6efd transparent",
            }}
          />
          <h5 className="mt-4 text-dark fw-semibold">
            Loading {roleConfig[activeTab]?.name} Employees
          </h5>
          <p className="text-muted mt-2">
            Please wait while we fetch the employee data...
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className="p-4"
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Header - HR Sidebar inspired */}
      <Card
        className="border-0 shadow-sm mb-4"
        style={{ borderRadius: "10px" }}
      >
        <Card.Header
          className="bg-white border-0 py-4 px-4"
          style={{ borderBottom: "1px solid #e0e0e0" }}
        >
          <Row className="align-items-center">
            <Col md={6}>
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: roleConfig[activeTab]?.bgColor,
                    color: roleConfig[activeTab]?.color,
                    fontSize: "22px",
                    border: `2px solid ${roleConfig[activeTab]?.borderColor}`,
                  }}
                >
                  {roleConfig[activeTab]?.icon}
                </div>
                <div>
                  <h4
                    className="fw-bold text-dark mb-1"
                    style={{ fontSize: "1.5rem" }}
                  >
                    {roleConfig[activeTab]?.name} Directory
                  </h4>
                  <p
                    className="text-muted mb-0"
                    style={{ fontSize: "0.875rem" }}
                  >
                    {roleConfig[activeTab]?.description} •{" "}
                    {filteredEmployees.length} employees
                  </p>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-end gap-3">
                <InputGroup style={{ maxWidth: "300px" }}>
                  <InputGroup.Text
                    className="bg-white border-end-0"
                    style={{ borderColor: "#dee2e6" }}
                  >
                    <FiSearch className="text-muted" />
                  </InputGroup.Text>
                  <FormControl
                    placeholder={`Search ${roleConfig[
                      activeTab
                    ]?.name.toLowerCase()}s...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                    style={{
                      borderColor: "#dee2e6",
                      fontSize: "0.875rem",
                    }}
                  />
                </InputGroup>
                <Button
                  variant="outline-secondary"
                  onClick={() => fetchEmployeesByRole(activeTab)}
                  disabled={loading}
                  className="d-flex align-items-center"
                  style={{
                    borderColor: "#dee2e6",
                    fontSize: "0.875rem",
                  }}
                >
                  <FiRefreshCw className={loading ? "spin" : ""} />
                </Button>
                <Button
                  variant="primary"
                  className="d-flex align-items-center"
                  onClick={() => navigate("/add-employee")}
                  style={{
                    backgroundColor: "#0d6efd",
                    borderColor: "#0d6efd",
                    fontSize: "0.875rem",
                  }}
                >
                  <FiPlus className="me-2" />
                  Add Employee
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Header>
      </Card>

      {/* Role Selection Tabs - HR Sidebar style */}
      <Card
        className="border-0 shadow-sm mb-4"
        style={{ borderRadius: "10px" }}
      >
        <Card.Body className="p-3">
          <div className="d-flex gap-2 overflow-auto pb-2">
            {Object.entries(roleConfig).map(([key, role]) => (
              <Button
                key={key}
                variant="link"
                className={`text-decoration-none px-3 py-2 rounded d-flex align-items-center ${
                  activeTab === key ? "fw-bold" : ""
                }`}
                onClick={() => setActiveTab(key)}
                style={{
                  backgroundColor:
                    activeTab === key ? role.bgColor : "transparent",
                  color: activeTab === key ? role.color : "#6c757d",
                  border: `1px solid ${
                    activeTab === key ? role.borderColor : "transparent"
                  }`,
                  fontSize: "0.875rem",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                <span className="me-2" style={{ fontSize: "1rem" }}>
                  {role.icon}
                </span>
                {role.name}
                <Badge
                  bg="light"
                  text="dark"
                  className="ms-2"
                  style={{
                    fontSize: "0.75rem",
                    backgroundColor: activeTab === key ? "white" : "#f8f9fa",
                  }}
                >
                  {key === activeTab ? filteredEmployees.length : "..."}
                </Badge>
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Main Content Card */}
      <Card className="border-0 shadow-sm" style={{ borderRadius: "10px" }}>
        <Card.Body className="p-0">
          {error ? (
            <div className="p-5 text-center">
              <Alert
                variant="danger"
                className="mx-auto border-0"
                style={{
                  maxWidth: "500px",
                  backgroundColor: "#f8d7da",
                  color: "#721c24",
                }}
              >
                <div className="d-flex flex-column align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center p-3 mb-3"
                    style={{ backgroundColor: "#f5c6cb" }}
                  >
                    <FiUser size={32} className="text-danger" />
                  </div>
                  <h5 className="fw-semibold mb-3">Unable to load employees</h5>
                  <p className="mb-4">{error}</p>
                  <Button
                    variant="outline-danger"
                    onClick={() => fetchEmployeesByRole(activeTab)}
                    className="px-4"
                    style={{ fontSize: "0.875rem" }}
                  >
                    <FiRefreshCw className="me-2" />
                    Retry
                  </Button>
                </div>
              </Alert>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-5 text-center">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center p-4 mb-3"
                style={{ backgroundColor: "#e9ecef" }}
              >
                <FiUser size={48} className="text-muted" />
              </div>
              <h5 className="text-dark fw-semibold mb-2">
                No {roleConfig[activeTab]?.name}s Found
              </h5>
              <p className="text-muted mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : `No ${roleConfig[
                      activeTab
                    ]?.name.toLowerCase()} employees available`}
              </p>
              {searchTerm && (
                <Button
                  variant="outline-dark"
                  onClick={() => setSearchTerm("")}
                  className="px-4"
                  style={{ fontSize: "0.875rem" }}
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th
                        className="ps-4 py-3 text-uppercase text-muted fw-semibold small"
                        style={{
                          width: "30%",
                          borderTop: "none",
                          borderBottom: "1px solid #dee2e6",
                        }}
                      >
                        Employee Details
                      </th>
                      <th
                        className="py-3 text-uppercase text-muted fw-semibold small"
                        style={{
                          borderTop: "none",
                          borderBottom: "1px solid #dee2e6",
                        }}
                      >
                        Contact Info
                      </th>
                      <th
                        className="py-3 text-uppercase text-muted fw-semibold small"
                        style={{
                          borderTop: "none",
                          borderBottom: "1px solid #dee2e6",
                        }}
                      >
                        Role & Department
                      </th>
                      <th
                        className="py-3 text-uppercase text-muted fw-semibold small"
                        style={{
                          borderTop: "none",
                          borderBottom: "1px solid #dee2e6",
                        }}
                      >
                        Joining Date
                      </th>
                      <th
                        className="py-3 text-uppercase text-muted fw-semibold small"
                        style={{
                          borderTop: "none",
                          borderBottom: "1px solid #dee2e6",
                        }}
                      >
                        Status
                      </th>
                      <th
                        className="pe-4 py-3 text-uppercase text-muted fw-semibold small text-center"
                        style={{
                          borderTop: "none",
                          borderBottom: "1px solid #dee2e6",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((employee) => {
                      const status = getStatusBadge(employee);
                      const isExpanded = expandedRow === employee._id;

                      return (
                        <React.Fragment key={employee._id}>
                          <tr
                            className="border-bottom"
                            style={{
                              backgroundColor: isExpanded ? "#f8f9fa" : "white",
                              cursor: "pointer",
                              transition: "background-color 0.2s",
                            }}
                            onClick={() =>
                              setExpandedRow(isExpanded ? null : employee._id)
                            }
                          >
                            <td className="ps-4 py-3">
                              <div className="d-flex align-items-center">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                  style={{
                                    width: "45px",
                                    height: "45px",
                                    backgroundColor:
                                      roleConfig[employee.source]?.bgColor ||
                                      "#e9ecef",
                                    color:
                                      roleConfig[employee.source]?.color ||
                                      "#495057",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    border: `2px solid ${
                                      roleConfig[employee.source]?.borderColor
                                    }40`,
                                  }}
                                >
                                  {employee.name?.charAt(0).toUpperCase() ||
                                    "E"}
                                </div>
                                <div>
                                  <h6
                                    className="fw-semibold text-dark mb-1"
                                    style={{ fontSize: "0.95rem" }}
                                  >
                                    {employee.name || "Unnamed Employee"}
                                  </h6>
                                  <div className="d-flex align-items-center gap-2">
                                    <code
                                      className="text-muted small"
                                      style={{ fontSize: "0.75rem" }}
                                    >
                                      <FaIdCard size={12} className="me-1" />
                                      {employee.employeeCode || "No Code"}
                                    </code>
                                    <Badge
                                      bg="light"
                                      text="dark"
                                      className="border px-2 py-1 small d-flex align-items-center"
                                      style={{ fontSize: "0.7rem" }}
                                    >
                                      {employee.source === "hr"
                                        ? "💼 HR"
                                        : employee.source === "telecaller"
                                        ? "📞 Telecaller"
                                        : "👤 Employee"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                  <FaPhoneAlt
                                    size={14}
                                    className="text-primary"
                                  />
                                  <span
                                    className="fw-medium"
                                    style={{ fontSize: "0.875rem" }}
                                  >
                                    {employee.mobileNo || "-"}
                                  </span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                  <FaEnvelope
                                    size={14}
                                    className="text-success"
                                  />
                                  <small
                                    className="text-truncate"
                                    style={{
                                      maxWidth: "200px",
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    {employee.emailId || "-"}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <Badge
                                className="px-3 py-2 fw-normal d-inline-flex align-items-center mb-2"
                                style={{
                                  backgroundColor:
                                    roleConfig[employee.role?.toLowerCase()]
                                      ?.bgColor || "#e9ecef",
                                  color:
                                    roleConfig[employee.role?.toLowerCase()]
                                      ?.color || "#495057",
                                  fontSize: "0.75rem",
                                  border: `1px solid ${
                                    roleConfig[employee.role?.toLowerCase()]
                                      ?.borderColor
                                  }40`,
                                }}
                              >
                                {employee.role}
                              </Badge>
                              <div className="text-muted small d-flex align-items-center">
                                <FiBriefcase size={12} className="me-1" />
                                {employee.designation || "Not assigned"}
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="d-flex flex-column">
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <FiCalendar
                                    size={16}
                                    className="text-muted"
                                  />
                                  <span
                                    className="fw-medium"
                                    style={{ fontSize: "0.875rem" }}
                                  >
                                    {formatDate(employee.dateOfJoining)}
                                  </span>
                                </div>
                                <small
                                  className="text-muted"
                                  style={{ fontSize: "0.75rem" }}
                                >
                                  Exp: {getExperience(employee.dateOfJoining)}
                                </small>
                              </div>
                            </td>
                            <td className="py-3">
                              <Badge
                                className="px-3 py-2 d-inline-flex align-items-center"
                                style={{
                                  backgroundColor: status.bgColor,
                                  color: status.color,
                                  fontSize: "0.75rem",
                                  border: `1px solid ${status.color}40`,
                                }}
                              >
                                {status.icon}
                                {status.text}
                              </Badge>
                            </td>
                            <td className="pe-4 py-3 text-center">
                              <div className="d-flex gap-2 justify-content-center">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails(employee);
                                  }}
                                  className="d-flex align-items-center px-3"
                                  style={{ fontSize: "0.75rem" }}
                                >
                                  <FiEye size={14} className="me-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(employee._id, employee.name);
                                  }}
                                  disabled={deleteLoading === employee._id}
                                  className="d-flex align-items-center px-3"
                                  style={{ fontSize: "0.75rem" }}
                                >
                                  {deleteLoading === employee._id ? (
                                    <Spinner size="sm" />
                                  ) : (
                                    <>
                                      <FiTrash2 size={14} className="me-1" />
                                      Delete
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(employee);
                                  }}
                                  className="d-flex align-items-center"
                                  style={{ fontSize: "0.75rem" }}
                                >
                                  <FiEdit size={14} />
                                </Button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Row Details */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="p-0">
                                <div
                                  className="p-4"
                                  style={{
                                    backgroundColor: "#f8f9fa",
                                    borderTop: "1px solid #e9ecef",
                                  }}
                                >
                                  <Row>
                                    <Col md={4}>
                                      <div className="mb-3">
                                        <h6 className="text-muted mb-2">
                                          Address
                                        </h6>
                                        <div className="d-flex align-items-start">
                                          <FaMapMarkerAlt
                                            className="me-2 mt-1 text-muted"
                                            size={14}
                                          />
                                          <p
                                            className="mb-0"
                                            style={{ fontSize: "0.875rem" }}
                                          >
                                            {employee.presentAddress ||
                                              "Not specified"}
                                          </p>
                                        </div>
                                      </div>
                                    </Col>
                                    <Col md={4}>
                                      <div className="mb-3">
                                        <h6 className="text-muted mb-2">
                                          Emergency Contact
                                        </h6>
                                        <div className="d-flex align-items-center">
                                          <FaPhoneAlt
                                            className="me-2 text-muted"
                                            size={14}
                                          />
                                          <span
                                            style={{ fontSize: "0.875rem" }}
                                          >
                                            {employee.emergencyContact ||
                                              "Not specified"}
                                          </span>
                                        </div>
                                      </div>
                                    </Col>
                                    <Col md={4}>
                                      <div className="mb-3">
                                        <h6 className="text-muted mb-2">
                                          Salary
                                        </h6>
                                        <div className="d-flex align-items-center">
                                          <FaBuilding
                                            className="me-2 text-muted"
                                            size={14}
                                          />
                                          <span
                                            style={{ fontSize: "0.875rem" }}
                                          >
                                            {employee.salary || "Not specified"}
                                          </span>
                                        </div>
                                      </div>
                                    </Col>
                                  </Row>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Card.Footer className="bg-white border-0 py-3 px-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-muted small">
                      Showing{" "}
                      <strong>
                        {indexOfFirstItem + 1}-
                        {Math.min(indexOfLastItem, filteredEmployees.length)}
                      </strong>{" "}
                      of <strong>{filteredEmployees.length}</strong> employees
                    </div>
                    <Pagination className="mb-0">
                      <Pagination.Prev
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      />
                      {[...Array(totalPages)].map((_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          active={i + 1 === currentPage}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      />
                    </Pagination>
                  </div>
                </Card.Footer>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* CSS Styles */}
      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
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
        .table > :not(caption) > * > * {
          border-bottom-width: 1px;
          vertical-align: middle;
        }
        .table tbody tr:hover {
          background-color: #f8f9fa !important;
        }
        .table tbody tr:last-child {
          border-bottom: none;
        }
        .badge {
          font-weight: 500;
        }
        .btn-outline-primary:hover {
          background-color: #0d6efd;
          color: white;
        }
        .btn-outline-danger:hover {
          background-color: #dc3545;
          color: white;
        }
        .btn-outline-secondary:hover {
          background-color: #6c757d;
          color: white;
        }
      `}</style>
    </Container>
  );
};

export default EmployeeList;
