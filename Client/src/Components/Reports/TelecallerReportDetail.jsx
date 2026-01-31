import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../../config/axios";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Badge,
  Spinner,
} from "react-bootstrap";
import {
  FaPhoneAlt,
  FaCalendarAlt,
  FaArrowLeft,
  FaUser,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { format, subDays } from "date-fns";

const TelecallerReportDetail = () => {
  const { telecallerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateDates = location.state || {};
  const defaultEnd = new Date();
  const defaultStart = subDays(defaultEnd, 30);
  const [startDate, setStartDate] = useState(
    stateDates.startDate || format(defaultStart, "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    stateDates.endDate || format(defaultEnd, "yyyy-MM-dd")
  );
  const [telecaller, setTelecaller] = useState(null);
  const [summary, setSummary] = useState(null);
  const [dateWise, setDateWise] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!telecallerId) return;
    const isInitialLoad = telecaller === null;
    const fetchDetail = async () => {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setRefetching(true);
      }
      setError(null);
      try {
        const res = await axios.get(
          `/api/telecaller/report/detail/${telecallerId}`,
          { params: { startDate, endDate } }
        );
        if (res.data?.success && res.data?.data) {
          setTelecaller(res.data.data.telecaller);
          setSummary(res.data.data.summary);
          setDateWise(res.data.data.dateWise || []);
        } else {
          setError("Data not found");
        }
      } catch (e) {
        console.error("Error fetching telecaller detail:", e);
        setError(e.response?.data?.message || "Failed to load report");
      } finally {
        setLoading(false);
        setRefetching(false);
      }
    };
    fetchDetail();
  }, [telecallerId, startDate, endDate]);

  if (loading && !telecaller) {
    return (
      <div className="container-fluid py-4 d-flex justify-content-center align-items-center min-vh-50">
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading report...</span>
      </div>
    );
  }

  if (error || !telecaller) {
    return (
      <div className="container-fluid py-4">
        <Card className="border border-danger">
          <Card.Body className="text-center py-5">
            <p className="text-danger mb-2">{error || "Telecaller not found."}</p>
            <Button variant="primary" onClick={() => navigate("/reports/telecaller-report")}>
              Back to Telecaller Report
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate("/reports/telecaller-report")}
            className="d-flex align-items-center gap-1"
          >
            <FaArrowLeft />
            Back to Telecaller Report
          </Button>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              size="sm"
              style={{ width: "140px" }}
              disabled={refetching}
            />
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              size="sm"
              style={{ width: "140px" }}
              disabled={refetching}
            />
            {refetching && (
              <span className="d-flex align-items-center gap-1 text-muted small">
                <Spinner animation="border" size="sm" />
                Updating...
              </span>
            )}
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <FaPhoneAlt className="text-info" />
            {telecaller.name} — Calling Detail
          </h5>
          <p className="text-muted small mb-0 mt-1">
            <FaUser className="me-1" /> {telecaller.employeeCode} • {telecaller.designation}
          </p>
        </Card.Header>
        <Card.Body>
          {summary && (
            <Row className="g-2 mb-4">
              <Col xs={6} md={4} lg={2}>
                <div className="border rounded p-2 text-center">
                  <div className="fw-bold text-primary">{summary.totalAssignedInRange ?? 0}</div>
                  <small className="text-muted">Assigned</small>
                </div>
              </Col>
              <Col xs={6} md={4} lg={2}>
                <div className="border rounded p-2 text-center">
                  <div className="fw-bold text-info">{summary.contacted ?? 0}</div>
                  <small className="text-muted">Contacted</small>
                </div>
              </Col>
              <Col xs={6} md={4} lg={2}>
                <div className="border rounded p-2 text-center">
                  <div className="fw-bold text-warning">{summary.forwarded ?? 0}</div>
                  <small className="text-muted">Forwarded</small>
                </div>
              </Col>
              <Col xs={6} md={4} lg={2}>
                <div className="border rounded p-2 text-center">
                  <div className="fw-bold text-success">{summary.appointmentScheduled ?? 0}</div>
                  <small className="text-muted">Appt. Scheduled</small>
                </div>
              </Col>
              <Col xs={6} md={4} lg={2}>
                <div className="border rounded p-2 text-center">
                  <div className="fw-bold text-secondary">{summary.callback ?? 0}</div>
                  <small className="text-muted">Callback</small>
                </div>
              </Col>
              <Col xs={6} md={4} lg={2}>
                <div className="border rounded p-2 text-center">
                  <div className="fw-bold text-dark">
                    {(summary.notInterested ?? 0) + (summary.wrongNumber ?? 0) + (summary.notReachable ?? 0)}
                  </div>
                  <small className="text-muted">Closed (NI/WN/NR)</small>
                </div>
              </Col>
            </Row>
          )}

          <h6 className="fw-semibold text-dark mb-3">
            <FaCalendarAlt className="me-2" />
            Date-wise breakdown
          </h6>
          {dateWise.length === 0 ? (
            <p className="text-muted">No activity in this date range.</p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {dateWise.map((day, idx) => (
                <Button
                  key={`${day.date}-${idx}`}
                  variant="outline-primary"
                  className="d-flex align-items-center justify-content-between flex-wrap gap-2 text-start"
                  onClick={() =>
                    navigate(`/reports/telecaller-report/${telecallerId}/date/${day.date}`, {
                      state: {
                        telecaller,
                        dayData: day,
                        startDate,
                        endDate,
                      },
                    })
                  }
                >
                  <span className="fw-medium">{day.date}</span>
                  <span className="d-flex align-items-center gap-2 flex-wrap">
                    <Badge bg="primary">Assigned: {day.assigned ?? 0}</Badge>
                    <Badge bg="info">Contacted: {day.contacted ?? 0}</Badge>
                    <Badge bg="warning" text="dark">Forwarded: {day.forwarded ?? 0}</Badge>
                    <Badge bg="success">Appt: {day.appointmentScheduled ?? 0}</Badge>
                    <FaExternalLinkAlt className="small" />
                  </span>
                </Button>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default TelecallerReportDetail;
