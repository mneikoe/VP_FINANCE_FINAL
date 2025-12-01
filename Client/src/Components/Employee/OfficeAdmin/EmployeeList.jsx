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
  Col
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
  FiBriefcase
} from "react-icons/fi";

const EmployeeList = () => {
  const navigate = useNavigate();
  
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("telecaller");

  // Role configurations
  const roleConfig = {
    telecaller: { name: "Telecaller", icon: "📞", color: "primary", api: "/api/telecaller" },
    hr: { name: "HR", icon: "💼", color: "info", api: "/api/hr" },
    telemarketer: { name: "Telemarketer", icon: "📱", color: "success", api: null },
    oe: { name: "OE", icon: "🔧", color: "warning", api: null },
    rm: { name: "RM", icon: "👔", color: "dark", api: null },
    oa: { name: "OA", icon: "📋", color: "secondary", api: null }
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
            responseData = telecallerResponse.data.telecallers.map(tc => ({
              _id: tc._id,
              name: tc.username,
              employeeCode: tc.employeeCode || `TC-${tc._id?.slice(-4)}`,
              emailId: tc.email,
              mobileNo: tc.mobileno,
              role: "Telecaller",
              designation: tc.designation || "Telecaller",
              dateOfJoining: tc.createdAt,
              source: "telecaller"
            }));
          }
          break;
        
        case "hr":
          const hrResponse = await axiosInstance.get("/api/hr");
          if (hrResponse.data?.HRs) {
            responseData = hrResponse.data.HRs.map(hr => ({
              _id: hr._id,
              name: hr.username,
              employeeCode: hr.employeeCode || `HR-${hr._id?.slice(-4)}`,
              emailId: hr.email,
              mobileNo: hr.mobileno,
              role: "HR",
              designation: hr.designation || "HR Manager",
              dateOfJoining: hr.createdAt,
              source: "hr"
            }));
          }
          break;
          
        default:
          responseData = [];
      }

      setEmployees(responseData);
      
    } catch (err) {
      console.error(`❌ ${role} API Error:`, err);
      setError(err.response?.data?.message || `Error fetching ${role} employees`);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesByRole(activeTab);
  }, [activeTab]);

  const filteredEmployees = employees.filter(employee =>
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.emailId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (employee) => {
    navigate(`/employee/${employee._id}`, { 
      state: { 
        employeeData: employee,
        source: employee.source 
      } 
    });
  };

  const handleDelete = async (employeeId, employeeName) => {
    if (window.confirm(`Are you sure you want to delete ${employeeName}?`)) {
      setDeleteLoading(employeeId);
      try {
        // Determine which API to call based on employee source
        const employee = employees.find(emp => emp._id === employeeId);
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
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatus = (employee) => {
    if (!employee.dateOfJoining) return { text: 'Not Joined', variant: 'secondary' };
    
    const joinDate = new Date(employee.dateOfJoining);
    const today = new Date();
    const diffDays = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return { text: 'New', variant: 'success' };
    if (diffDays < 180) return { text: 'Active', variant: 'primary' };
    return { text: 'Experienced', variant: 'info' };
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted">Loading {roleConfig[activeTab].name} employees...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger" className="mx-3">
          <div className="d-flex align-items-center">
            <div className="flex-grow-1">
              <h5 className="mb-1">Unable to load employees</h5>
              <p className="mb-0 text-muted">{error}</p>
            </div>
            <Button variant="outline-danger" onClick={() => fetchEmployeesByRole(activeTab)}>
              <FiRefreshCw className="me-2" />
              Retry
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold text-dark mb-1">👥 Employee Directory</h2>
              <p className="text-muted mb-0">
                Manage and view all employees across different roles and departments
              </p>
            </div>
            <Badge bg="light" text="dark" className="fs-6 px-3 py-2">
              Total: <strong>{employees.length}</strong> {roleConfig[activeTab].name}s
            </Badge>
          </div>
        </Col>
      </Row>

      {/* Main Card */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom px-4 py-3">
          <Row className="align-items-center">
            <Col md={6}>
              <div className="d-flex align-items-center">
                <InputGroup style={{ maxWidth: '400px' }}>
                  <InputGroup.Text className="bg-light border-end-0">
                    <FiSearch size={18} className="text-muted" />
                  </InputGroup.Text>
                  <FormControl
                    placeholder={`Search ${roleConfig[activeTab].name.toLowerCase()}s...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                  />
                </InputGroup>
              </div>
            </Col>
            <Col md={6} className="text-end">
              <div className="d-flex justify-content-end gap-2">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => fetchEmployeesByRole(activeTab)}
                  disabled={loading}
                  className="d-flex align-items-center"
                >
                  <FiRefreshCw size={16} className={loading ? "spin" : ""} />
                  <span className="ms-2">Refresh</span>
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Header>

        {/* Role Tabs */}
        <div className="px-4 pt-3 border-bottom">
          <Tabs
            activeKey={activeTab}
            onSelect={(tab) => setActiveTab(tab)}
            className="border-0"
          >
            {Object.entries(roleConfig).map(([key, role]) => (
              <Tab
                key={key}
                eventKey={key}
                title={
                  <div className="d-flex align-items-center px-3 py-2">
                    <span className="me-2 fs-5">{role.icon}</span>
                    <span className="fw-medium">{role.name}</span>
                    <Badge 
                      bg={role.color} 
                      className="ms-2" 
                      style={{ fontSize: '0.7rem', minWidth: '24px' }}
                    >
                      {employees.length}
                    </Badge>
                  </div>
                }
              />
            ))}
          </Tabs>
        </div>

        {/* Employees Table */}
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3 text-uppercase text-muted fw-semibold small border-0">Employee</th>
                  <th className="py-3 text-uppercase text-muted fw-semibold small border-0">Contact</th>
                  <th className="py-3 text-uppercase text-muted fw-semibold small border-0">Role & Designation</th>
                  <th className="py-3 text-uppercase text-muted fw-semibold small border-0">Joining Date</th>
                  <th className="py-3 text-uppercase text-muted fw-semibold small border-0">Status</th>
                  <th className="pe-4 py-3 text-uppercase text-muted fw-semibold small border-0 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="py-5">
                        <FiUser size={48} className="text-muted mb-3" />
                        <h5 className="text-muted">
                          {searchTerm ? "No employees found" : `No ${roleConfig[activeTab].name}s available`}
                        </h5>
                        <p className="text-muted mb-0">
                          {searchTerm 
                            ? "Try adjusting your search criteria" 
                            : `No ${roleConfig[activeTab].name.toLowerCase()} employees found in the system`
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => {
                    const status = getStatus(employee);
                    return (
                      <tr key={employee._id} className="border-bottom">
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center">
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center me-3"
                              style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: '#f8f9fa',
                                border: '2px solid #e9ecef',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#495057'
                              }}
                            >
                              {employee.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                              <h6 className="mb-1 fw-semibold text-dark">
                                {employee.name || "Unnamed Employee"}
                              </h6>
                              <div className="d-flex align-items-center gap-2">
                                <small className="text-muted">
                                  <FiUser size={12} className="me-1" />
                                  {employee.employeeCode || "No Code"}
                                </small>
                                {employee.source && (
                                  <Badge bg="outline-primary" className="border border-primary text-primary px-2">
                                    {employee.source === "hr" ? "💼 HR" : "📞 Telecaller"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <FiPhone size={16} className="text-primary" />
                              <span className="fw-medium">{employee.mobileNo || "-"}</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <FiMail size={16} className="text-success" />
                              <small className="text-truncate" style={{ maxWidth: '200px' }}>
                                {employee.emailId || "-"}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div>
                            <Badge 
                              bg={roleConfig[employee.role?.toLowerCase()]?.color || "secondary"} 
                              className="mb-2 fw-normal"
                            >
                              {employee.role}
                            </Badge>
                            <div className="text-muted small">
                              <FiBriefcase size={12} className="me-1" />
                              {employee.designation || "Not assigned"}
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="d-flex align-items-center gap-2">
                            <FiCalendar size={16} className="text-muted" />
                            <span className="fw-medium">{formatDate(employee.dateOfJoining)}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge 
                            bg={status.variant} 
                            className="fw-normal px-3 py-2"
                            style={{ fontSize: '0.75rem' }}
                          >
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
                              onClick={() => handleDelete(employee._id, employee.name)}
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
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Container>
  );
};

export default EmployeeList;