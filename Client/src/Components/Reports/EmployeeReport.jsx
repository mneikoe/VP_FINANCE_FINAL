import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../config/axios";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Table,
  Badge,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import {
  FaUsers,
  FaFilter,
  FaFileAlt,
  FaCalendarAlt,
  FaUserTie,
  FaEye,
  FaSync,
} from "react-icons/fa";
import { format, subDays } from "date-fns";

const EmployeeReport = () => {
  const navigate = useNavigate();
  const defaultEnd = new Date();
  const defaultStart = subDays(defaultEnd, 30);
  const [role, setRole] = useState("all");
  const [startDate, setStartDate] = useState(
    format(defaultStart, "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(defaultEnd, "yyyy-MM-dd"));
  const [roles, setRoles] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchRoles = async () => {
    try {
      const res = await axios.get("/api/employee/getEmployeeRoles");
      if (res.data?.success && res.data?.data?.roles) {
        const allRoles = res.data.data.roles;
        setRoles(allRoles.filter((r) => r !== "Telecaller" && r !== "HR"));
      }
    } catch (e) {
      console.error("Error fetching roles:", e);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    setFetched(false);
    try {
      const params = { startDate, endDate };
      if (role && role !== "all") params.role = role;
      const res = await axios.get("/api/Task/report/list", { params });
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setList(res.data.data);
      } else {
        setList([]);
      }
    } catch (e) {
      console.error("Error fetching employee report:", e);
      setList([]);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleViewReport = (employeeId) => {
    navigate(`/reports/employee-report/${employeeId}`, {
      state: { startDate, endDate },
    });
  };

  return (
    <div className="container-fluid py-4">
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 py-3">
          <div className="d-flex align-items-center gap-2">
            <FaFileAlt className="text-primary" size={20} />
            <h5 className="mb-0 fw-bold text-dark">Employee Report</h5>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Filters */}
          <Card className="mb-4 border">
            <Card.Body>
              <h6 className="fw-semibold text-dark mb-3">
                <FaFilter className="me-2" />
                Filters
              </h6>
              <Row className="g-3">
                <Col md={3}>
                  <Form.Label className="small fw-medium">Role</Form.Label>
                  <Form.Select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    size="sm"
                  >
                    <option value="all">All Roles</option>
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Label className="small fw-medium">From Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    size="sm"
                  />
                </Col>
                <Col md={3}>
                  <Form.Label className="small fw-medium">To Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    size="sm"
                  />
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={fetchReport}
                    disabled={loading}
                    className="d-flex align-items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <FaSync className="me-1" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Table */}
          {fetched && (
            <div className="table-responsive">
              <Table hover bordered className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="text-nowrap">#</th>
                    <th>Employee Name</th>
                    <th>Employee Code</th>
                    <th>Role</th>
                    <th>Designation</th>
                    <th className="text-center">Total Tasks</th>
                    <th className="text-center">Completed</th>
                    <th className="text-center">Pending</th>
                    <th className="text-center">Suspects (TC)</th>
                    <th className="text-center">Managed (HR)</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {list.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center text-muted py-4">
                        No employees found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    list.map((emp, idx) => (
                      <tr key={emp._id}>
                        <td>{idx + 1}</td>
                        <td className="fw-medium">{emp.name || "—"}</td>
                        <td>{emp.employeeCode || "—"}</td>
                        <td>
                          <Badge bg="primary" className="text-nowrap">
                            {emp.role || "—"}
                          </Badge>
                          {emp.oeType && (
                            <Badge
                              bg="info"
                              className="ms-1 text-nowrap"
                              title="OE Type"
                            >
                              {emp.oeType === "onfield" ? "On Field" : "In House"}
                            </Badge>
                          )}
                        </td>
                        <td>{emp.designation || "—"}</td>
                        <td className="text-center">{emp.totalTasks ?? 0}</td>
                        <td className="text-center">
                          <Badge bg="success">{emp.completedTasks ?? 0}</Badge>
                        </td>
                        <td className="text-center">
                          <Badge bg="warning" text="dark">
                            {emp.pendingTasks ?? 0}
                          </Badge>
                        </td>
                        <td className="text-center">
                          {emp.role === "Telecaller" ? (
                            <Badge bg="secondary">{emp.assignedSuspectsCount ?? 0}</Badge>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="text-center">
                          {emp.role === "HR" ? (
                            <Badge bg="info">{emp.managedEmployeesCount ?? 0}</Badge>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="d-inline-flex align-items-center gap-1"
                            onClick={() => handleViewReport(emp._id)}
                          >
                            <FaEye />
                            View Report
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
          {!fetched && !loading && (
            <div className="text-center text-muted py-5">
              <FaUsers size={40} className="mb-2" />
              <p className="mb-0">
                Select filters and click &quot;Generate Report&quot; to view
                employees.
              </p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default EmployeeReport;
