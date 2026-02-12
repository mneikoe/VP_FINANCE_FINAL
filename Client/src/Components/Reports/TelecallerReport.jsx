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
} from "react-bootstrap";
import {
  FaPhoneAlt,
  FaFilter,
  FaSync,
  FaEye,
  FaCalendarAlt,
  FaUser,
  FaArrowRight,
  FaClipboardList,
} from "react-icons/fa";
import { format, subDays } from "date-fns";

const TelecallerReport = () => {
  const navigate = useNavigate();
  const defaultEnd = new Date();
  const defaultStart = subDays(defaultEnd, 30);
  const [startDate, setStartDate] = useState(format(defaultStart, "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(defaultEnd, "yyyy-MM-dd"));
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    setFetched(false);
    try {
      const res = await axios.get("/api/telecaller/report/list", {
        params: { startDate, endDate },
      });
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setList(res.data.data);
      } else {
        setList([]);
      }
    } catch (e) {
      console.error("Error fetching telecaller report:", e);
      setList([]);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  const handleViewDetail = (telecallerId) => {
    navigate(`/reports/telecaller-report/${telecallerId}`, {
      state: { startDate, endDate },
    });
  };

  return (
    <div className="container-fluid py-4">
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 py-3">
          <div className="d-flex align-items-center gap-2">
            <FaPhoneAlt className="text-info" size={22} />
            <h5 className="mb-0 fw-bold text-dark">Telecaller Calling Report</h5>
          </div>
          <p className="text-muted small mb-0 mt-1">
            Date range pe kitne assign hue, kitne contact, forward, appointment schedule — calling ka poora summary
          </p>
        </Card.Header>
        <Card.Body>
          <Card className="mb-4 border">
            <Card.Body>
              <h6 className="fw-semibold text-dark mb-3">
                <FaFilter className="me-2" />
                Date Range
              </h6>
              <Row className="g-3">
                <Col md={3}>
                  <Form.Label className="small fw-medium">
                    <FaCalendarAlt className="me-1" /> From Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    size="sm"
                  />
                </Col>
                <Col md={3}>
                  <Form.Label className="small fw-medium">
                    <FaCalendarAlt className="me-1" /> To Date
                  </Form.Label>
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

          {fetched && (
            <div className="table-responsive">
              <Table hover bordered className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="text-nowrap">#</th>
                    <th><FaUser className="me-1" /> Telecaller</th>
                    <th>Code</th>
                    <th className="text-center">Assigned</th>
                    <th className="text-center">Contacted</th>
                    <th className="text-center">Forwarded</th>
                    <th className="text-center">Appt. Scheduled</th>
                    <th className="text-center">Callback</th>
                    <th className="text-center">Not Interested</th>
                    <th className="text-center">Wrong No.</th>
                    <th className="text-center">Not Reachable</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {list.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="text-center text-muted py-4">
                        No telecallers found for the selected date range.
                      </td>
                    </tr>
                  ) : (
                    list.map((tc, idx) => (
                      <tr key={tc._id}>
                        <td>{idx + 1}</td>
                        <td className="fw-medium">{tc.name || "—"}</td>
                        <td><Badge bg="secondary">{tc.employeeCode || "—"}</Badge></td>
                        <td className="text-center">
                          <Badge bg="primary">{tc.totalAssignedInRange ?? 0}</Badge>
                        </td>
                        <td className="text-center">
                          <Badge bg="info">{tc.contacted ?? 0}</Badge>
                        </td>
                        <td className="text-center">
                          <Badge bg="warning" text="dark">{tc.forwarded ?? 0}</Badge>
                        </td>
                        <td className="text-center">
                          <Badge bg="success">{tc.appointmentScheduled ?? 0}</Badge>
                        </td>
                        <td className="text-center">
                          <Badge bg="secondary">{tc.callback ?? 0}</Badge>
                        </td>
                        <td className="text-center">{tc.notInterested ?? 0}</td>
                        <td className="text-center">{tc.wrongNumber ?? 0}</td>
                        <td className="text-center">{tc.notReachable ?? 0}</td>
                        <td className="text-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="d-inline-flex align-items-center gap-1"
                            onClick={() => handleViewDetail(tc._id)}
                          >
                            <FaEye />
                            Detail
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
              <FaPhoneAlt size={40} className="mb-2 text-info" />
              <p className="mb-0">
                Select date range and click &quot;Generate Report&quot; to view calling summary.
              </p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default TelecallerReport;
