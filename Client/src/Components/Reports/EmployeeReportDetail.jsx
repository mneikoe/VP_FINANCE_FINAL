import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaUserTie,
  FaFileAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaStickyNote,
  FaShareAlt,
} from "react-icons/fa";
import { format, parseISO } from "date-fns";

const EmployeeReportDetail = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateDates = location.state || {};
  const defaultEnd = new Date();
  const defaultStart = new Date(defaultEnd);
  defaultStart.setDate(defaultStart.getDate() - 30);
  const [startDate, setStartDate] = useState(
    stateDates.startDate || format(defaultStart, "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    stateDates.endDate || format(defaultEnd, "yyyy-MM-dd")
  );
  const [employee, setEmployee] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/Task/report/activity/${employeeId}`,
        { params: { startDate, endDate } }
      );
      if (res.data?.success && res.data?.data) {
        setEmployee(res.data.data.employee);
        setActivities(res.data.data.activities || []);
      } else {
        setEmployee(null);
        setActivities([]);
      }
    } catch (e) {
      console.error("Error fetching activity report:", e);
      setEmployee(null);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) fetchReport();
  }, [employeeId, startDate, endDate]);

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      const date = typeof d === "string" ? parseISO(d) : d;
      return format(date, "dd MMM yyyy");
    } catch {
      return "—";
    }
  };

  const formatDateTime = (d) => {
    if (!d) return "—";
    try {
      const date = typeof d === "string" ? parseISO(d) : d;
      return format(date, "dd MMM yyyy, HH:mm");
    } catch {
      return "—";
    }
  };

  const statusBadge = (status) => {
    const map = {
      assigned: "secondary",
      "in-progress": "info",
      completed: "success",
      cancelled: "danger",
      overdue: "warning",
    };
    return (
      <Badge bg={map[status] || "secondary"}>
        {(status || "—").replace(/-/g, " ")}
      </Badge>
    );
  };

  if (loading && !employee) {
    return (
      <div className="container-fluid py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading report...</p>
      </div>
    );
  }

  if (!employee && !loading) {
    return (
      <div className="container-fluid py-4">
        <Card>
          <Card.Body className="text-center py-5">
            <p className="text-danger mb-2">Employee not found.</p>
            <Button variant="primary" onClick={() => navigate("/reports/employee-report")}>
              Back to Employee Report
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <Button
        variant="outline-secondary"
        size="sm"
        className="mb-3 d-inline-flex align-items-center gap-1"
        onClick={() => navigate("/reports/employee-report")}
      >
        <FaArrowLeft />
        Back to Employee Report
      </Button>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-white border-0 py-3">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                <FaFileAlt className="text-primary" />
                Employee Activity Report
              </h5>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {/* Employee summary */}
          <Card className="mb-4 bg-light border-0">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6 className="text-muted mb-2">Employee</h6>
                  <p className="mb-1 fw-bold fs-5">{employee?.name}</p>
                  <p className="mb-0 small text-muted">
                    {employee?.employeeCode} • {employee?.role}
                    {employee?.oeType && (
                      <Badge bg="info" className="ms-1">
                        {employee.oeType === "onfield" ? "On Field" : "In House"}
                      </Badge>
                    )}
                  </p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted mb-2">Date Range</h6>
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      size="sm"
                      style={{ width: "auto" }}
                    />
                    <span className="text-muted">to</span>
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      size="sm"
                      style={{ width: "auto" }}
                    />
                    <Button variant="outline-primary" size="sm" onClick={fetchReport} disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : "Apply"}
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Activity table */}
          <div className="table-responsive">
            <Table bordered hover className="mb-0 align-middle">
              <thead className="table-dark">
                <tr>
                  <th className="text-nowrap">#</th>
                  <th>Activity Type</th>
                  <th>Date Assigned</th>
                  <th>Task / Item Name</th>
                  <th>Type</th>
                  <th>Company / Product</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Date Completed</th>
                  <th>Assigned By</th>
                  <th>Assignment Remarks</th>
                  <th>Completion Remarks</th>
                  <th>Activity (Forwarded)</th>
                </tr>
              </thead>
              <tbody>
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="text-center text-muted py-4">
                      No activity in the selected date range.
                    </td>
                  </tr>
                ) : (
                  activities.map((a, idx) => (
                    <tr key={a.taskId || idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <Badge
                          bg={
                            a.activityType === "Task"
                              ? "primary"
                              : a.activityType === "Suspect Assigned"
                              ? "secondary"
                              : a.activityType === "HR Responsibility"
                              ? "info"
                              : "dark"
                          }
                        >
                          {a.activityType || "Task"}
                        </Badge>
                      </td>
                      <td className="text-nowrap">{formatDateTime(a.assignedAt)}</td>
                      <td className="fw-medium">{a.taskName || "—"}</td>
                      <td>
                        <Badge bg="secondary">{a.taskType || "—"}</Badge>
                      </td>
                      <td>
                        {a.company || "—"}
                        {a.product && ` / ${a.product}`}
                      </td>
                      <td className="text-nowrap">{formatDate(a.dueDate)}</td>
                      <td>{statusBadge(a.status)}</td>
                      <td className="text-nowrap">{formatDateTime(a.completedAt)}</td>
                      <td>{a.assignedBy || "—"}</td>
                      <td className="small text-muted" style={{ maxWidth: 180 }}>
                        {a.assignmentRemarks !== "—" ? a.assignmentRemarks : "—"}
                      </td>
                      <td className="small text-muted" style={{ maxWidth: 180 }}>
                        {a.completionRemarks !== "—" ? a.completionRemarks : "—"}
                      </td>
                      <td className="small">
                        {a.forwardedFromRM && (
                          <div className="mb-1">
                            <Badge bg="primary" className="me-1">
                              RM→OE
                            </Badge>
                            {formatDateTime(a.forwardedFromRM.at)}
                            {a.forwardedFromRM.remark && (
                              <div className="text-muted">{a.forwardedFromRM.remark}</div>
                            )}
                          </div>
                        )}
                        {a.oeForwardedToRM && (
                          <div>
                            <Badge bg="info" className="me-1">
                              OE→RM
                            </Badge>
                            {formatDateTime(a.oeForwardedToRM.at)}
                            {a.oeForwardedToRM.remark && (
                              <div className="text-muted">{a.oeForwardedToRM.remark}</div>
                            )}
                          </div>
                        )}
                        {!a.forwardedFromRM && !a.oeForwardedToRM && "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EmployeeReportDetail;
