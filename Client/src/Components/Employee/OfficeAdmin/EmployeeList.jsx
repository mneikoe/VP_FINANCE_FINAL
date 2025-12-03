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
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../config/axios";
import {
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiTrash2,
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar,
  FiBriefcase,
  FiMoreVertical,
  FiFilter,
  FiDownload,
  FiPlus,
} from "react-icons/fi";
import {
  FaUserTie,
  FaPhoneAlt,
  FaEnvelope,
  FaUserCheck,
  FaUserClock,
  FaUserGraduate,
} from "react-icons/fa";

const EmployeeList = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("telecaller");

  // Role configurations with better colors matching theme
  const roleConfig = {
    telecaller: {
      name: "Telecaller",
      icon: "📞",
      color: "info",
      bgColor: "#0dcaf0",
      api: "/api/telecaller",
      description: "Telecaller employees handling customer calls",
    },
    hr: {
      name: "HR",
      icon: "💼",
      color: "warning",
      bgColor: "#ffc107",
      api: "/api/hr",
      description: "Human Resource management team",
    },
    telemarketer: {
      name: "Telemarketer",
      icon: "📱",
      color: "success",
      bgColor: "#198754",
      api: null,
      description: "Telemarketing professionals",
    },
    oe: {
      name: "Operations Executive",
      icon: "🔧",
      color: "secondary",
      bgColor: "#6c757d",
      api: null,
      description: "Operations and logistics team",
    },
    rm: {
      name: "Relationship Manager",
      icon: "👔",
      color: "primary",
      bgColor: "#0d6efd",
      api: null,
      description: "Client relationship managers",
    },
    oa: {
      name: "Office Admin",
      icon: "📋",
      color: "dark",
      bgColor: "#212529",
      api: null,
      description: "Office administration staff",
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
              dateOfJoining: tc.createdAt,
              source: "telecaller",
              status: "active",
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
              dateOfJoining: hr.createdAt,
              source: "hr",
              status: "active",
            }));
          }
          break;

        default:
          // Mock data for other roles
          responseData = Array.from({ length: 5 }, (_, i) => ({
            _id: `${role}-${i + 1}`,
            name: `${roleConfig[role].name} ${i + 1}`,
            employeeCode: `${roleConfig[role].name
              .substring(0, 2)
              .toUpperCase()}-00${i + 1}`,
            emailId: `${role}${i + 1}@company.com`,
            mobileNo: `98765432${i}0`,
            role: roleConfig[role].name,
            designation: roleConfig[role].name,
            dateOfJoining: new Date(
              Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
            ).toISOString(),
            source: role,
            status: Math.random() > 0.3 ? "active" : "inactive",
          }));
      }

      setEmployees(responseData);
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

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.emailId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (employee) => {
    navigate(`/employee/${employee._id}`, {
      state: {
        employeeData: employee,
        source: employee.source,
      },
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
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const getStatusBadge = (employee) => {
    if (employee.status === "inactive")
      return {
        text: "Inactive",
        variant: "danger",
        icon: <FaUserClock className="me-1" />,
      };

    if (!employee.dateOfJoining)
      return {
        text: "Not Joined",
        variant: "secondary",
        icon: <FaUser className="me-1" />,
      };

    const joinDate = new Date(employee.dateOfJoining);
    const today = new Date();
    const diffDays = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24));

    if (diffDays < 30)
      return {
        text: "New",
        variant: "success",
        icon: <FaUserCheck className="me-1" />,
      };
    if (diffDays < 180)
      return {
        text: "Active",
        variant: "primary",
        icon: <FaUserCheck className="me-1" />,
      };
    return {
      text: "Experienced",
      variant: "info",
      icon: <FaUserGraduate className="me-1" />,
    };
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ minHeight: "60vh" }}
        >
          <Spinner
            animation="border"
            variant="primary"
            style={{ width: "3rem", height: "3rem" }}
          />
          <h5 className="mt-4 text-dark fw-semibold">
            Loading {roleConfig[activeTab].name} Employees
          </h5>
          <p className="text-muted">
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
      style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="fw-bold text-dark mb-2">👥 Employee Directory</h2>
            <p className="text-muted mb-0">
              Manage and view all employees across different roles and
              departments
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-dark"
              size="sm"
              className="d-flex align-items-center"
            >
              <FiDownload className="me-2" />
              Export
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="d-flex align-items-center"
            >
              <FiPlus className="me-2" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <Row className="g-3 mb-4">
          {Object.entries(roleConfig).map(([key, role]) => (
            <Col key={key} xs={6} md={4} lg={2}>
              <Card
                className={`border-0 shadow-sm cursor-pointer ${
                  activeTab === key ? "border-primary border-2" : ""
                }`}
                onClick={() => setActiveTab(key)}
                style={{
                  backgroundColor:
                    activeTab === key ? `${role.bgColor}15` : "white",
                  transition: "all 0.3s",
                }}
              >
                <Card.Body className="p-3 text-center">
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor:
                        activeTab === key ? role.bgColor : "#f8f9fa",
                      color: activeTab === key ? "white" : role.bgColor,
                      fontSize: "20px",
                    }}
                  >
                    {role.icon}
                  </div>
                  <h6 className="fw-semibold text-dark mb-1">{role.name}</h6>
                  <div className="d-flex justify-content-center align-items-center">
                    <Badge
                      bg={activeTab === key ? "light" : "secondary"}
                      text={activeTab === key ? "dark" : "white"}
                      className="px-2 py-1"
                    >
                      {key === activeTab ? filteredEmployees.length : "..."}
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Main Content Card */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 py-3 px-4">
          <Row className="align-items-center">
            <Col md={6}>
              <div className="d-flex align-items-center">
                <div className="bg-light rounded-circle p-2 me-3">
                  <FaUserTie size={20} className="text-primary" />
                </div>
                <div>
                  <h5 className="fw-semibold text-dark mb-1">
                    {roleConfig[activeTab].name} Employees
                  </h5>
                  <p className="text-muted small mb-0">
                    {roleConfig[activeTab].description}
                  </p>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-end gap-2">
                <InputGroup style={{ maxWidth: "300px" }}>
                  <InputGroup.Text className="bg-white border-end-0">
                    <FiSearch className="text-muted" />
                  </InputGroup.Text>
                  <FormControl
                    placeholder={`Search ${roleConfig[
                      activeTab
                    ].name.toLowerCase()}s...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                  />
                </InputGroup>
                <Button
                  variant="outline-secondary"
                  onClick={() => fetchEmployeesByRole(activeTab)}
                  disabled={loading}
                  className="d-flex align-items-center"
                >
                  <FiRefreshCw className={loading ? "spin" : ""} />
                </Button>
                <Button
                  variant="outline-dark"
                  className="d-flex align-items-center"
                >
                  <FiFilter />
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          {error ? (
            <div className="p-5 text-center">
              <Alert
                variant="danger"
                className="mx-auto"
                style={{ maxWidth: "500px" }}
              >
                <div className="d-flex flex-column align-items-center">
                  <div className="bg-danger bg-opacity-10 rounded-circle p-3 mb-3">
                    <FiUser size={32} className="text-danger" />
                  </div>
                  <h5 className="text-danger fw-semibold">
                    Unable to load employees
                  </h5>
                  <p className="text-muted mb-3">{error}</p>
                  <Button
                    variant="outline-danger"
                    onClick={() => fetchEmployeesByRole(activeTab)}
                    className="px-4"
                  >
                    <FiRefreshCw className="me-2" />
                    Retry
                  </Button>
                </div>
              </Alert>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-5 text-center">
              <div className="bg-light rounded-circle p-4 d-inline-block mb-3">
                <FiUser size={48} className="text-muted" />
              </div>
              <h5 className="text-dark fw-semibold mb-2">
                No {roleConfig[activeTab].name}s Found
              </h5>
              <p className="text-muted mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : `No ${roleConfig[
                      activeTab
                    ].name.toLowerCase()} employees available`}
              </p>
              {searchTerm && (
                <Button
                  variant="outline-dark"
                  onClick={() => setSearchTerm("")}
                  className="px-4"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th
                      className="ps-4 py-3 text-uppercase text-muted fw-semibold small"
                      style={{ width: "30%" }}
                    >
                      Employee Details
                    </th>
                    <th className="py-3 text-uppercase text-muted fw-semibold small">
                      Contact Info
                    </th>
                    <th className="py-3 text-uppercase text-muted fw-semibold small">
                      Role
                    </th>
                    <th className="py-3 text-uppercase text-muted fw-semibold small">
                      Joining Date
                    </th>
                    <th className="py-3 text-uppercase text-muted fw-semibold small">
                      Status
                    </th>
                    <th className="pe-4 py-3 text-uppercase text-muted fw-semibold small text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => {
                    const status = getStatusBadge(employee);
                    return (
                      <tr key={employee._id} className="border-bottom">
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center me-3"
                              style={{
                                width: "50px",
                                height: "50px",
                                backgroundColor:
                                  roleConfig[employee.source]?.bgColor + "20" ||
                                  "#f8f9fa",
                                color:
                                  roleConfig[employee.source]?.bgColor ||
                                  "#495057",
                                fontSize: "18px",
                                fontWeight: "600",
                                border: `2px solid ${
                                  roleConfig[employee.source]?.bgColor
                                }40`,
                              }}
                            >
                              {employee.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                              <h6 className="fw-semibold text-dark mb-1">
                                {employee.name || "Unnamed Employee"}
                              </h6>
                              <div className="d-flex align-items-center gap-2">
                                <code className="text-muted small">
                                  {employee.employeeCode || "No Code"}
                                </code>
                                <Badge
                                  bg="light"
                                  text="dark"
                                  className="border px-2 py-1 small"
                                >
                                  {employee.source === "hr"
                                    ? "💼 HR"
                                    : "📞 Telecaller"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <FaPhoneAlt size={14} className="text-primary" />
                              <span className="fw-medium">
                                {employee.mobileNo || "-"}
                              </span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <FaEnvelope size={14} className="text-success" />
                              <small
                                className="text-truncate"
                                style={{ maxWidth: "200px" }}
                              >
                                {employee.emailId || "-"}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge
                            bg={
                              roleConfig[employee.role?.toLowerCase()]?.color ||
                              "secondary"
                            }
                            className="px-3 py-2 fw-normal"
                            style={{
                              backgroundColor:
                                roleConfig[employee.role?.toLowerCase()]
                                  ?.bgColor,
                            }}
                          >
                            {employee.role}
                          </Badge>
                          <div className="text-muted small mt-1">
                            <FiBriefcase size={12} className="me-1" />
                            {employee.designation || "Not assigned"}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="d-flex align-items-center gap-2">
                            <FiCalendar size={16} className="text-muted" />
                            <span className="fw-medium">
                              {formatDate(employee.dateOfJoining)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge
                            bg={status.variant}
                            className="px-3 py-2 d-inline-flex align-items-center"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {status.icon}
                            {status.text}
                          </Badge>
                        </td>
                        <td className="pe-4 py-3">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewDetails(employee)}
                              className="d-flex align-items-center px-3"
                            >
                              <FiEye size={14} className="me-1" />
                              View
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() =>
                                handleDelete(employee._id, employee.name)
                              }
                              disabled={deleteLoading === employee._id}
                              className="d-flex align-items-center px-3"
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
                            <Dropdown>
                              <Dropdown.Toggle
                                variant="outline-dark"
                                size="sm"
                                className="d-flex align-items-center"
                              >
                                <FiMoreVertical />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item>Edit Details</Dropdown.Item>
                                <Dropdown.Item>Change Role</Dropdown.Item>
                                <Dropdown.Item>Generate Report</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item className="text-danger">
                                  Deactivate
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>

        {filteredEmployees.length > 0 && (
          <Card.Footer className="bg-white border-0 py-3 px-4">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                Showing <strong>{filteredEmployees.length}</strong> of{" "}
                <strong>{employees.length}</strong>{" "}
                {roleConfig[activeTab].name.toLowerCase()}s
              </div>
              <div className="d-flex gap-2">
                <Button variant="outline-dark" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="dark" size="sm">
                  1
                </Button>
                <Button variant="outline-dark" size="sm">
                  2
                </Button>
                <Button variant="outline-dark" size="sm">
                  3
                </Button>
                <Button variant="outline-dark" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </Card.Footer>
        )}
      </Card>

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
        }
        .table tbody tr:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </Container>
  );
};

export default EmployeeList;
